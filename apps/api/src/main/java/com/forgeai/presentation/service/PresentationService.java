package com.forgeai.presentation.service;

import com.forgeai.ai.dto.AIRequest;
import com.forgeai.ai.dto.AIResponse;
import com.forgeai.ai.service.AIOrchestrator;
import com.forgeai.common.exception.ResourceNotFoundException;
import com.forgeai.presentation.dto.PresentationDto;
import com.forgeai.presentation.model.Presentation;
import com.forgeai.presentation.repository.PresentationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PresentationService {

    private final PresentationRepository presentationRepository;
    private final AIOrchestrator aiOrchestrator;

    private static final String SYSTEM_PROMPT = """
            You are a world-class presentation designer. Generate a professional slide deck in JSON format.
            Each slide must have: id, order, title, content (markdown with bullet points), notes (speaker notes), and layout.
            Content should be concise, impactful, and visually oriented.
            Return a valid JSON array of slides. Do NOT include any explanation outside the JSON.
            """;

    public PresentationDto.Response create(String userId, PresentationDto.CreateRequest request) {
        Presentation presentation = Presentation.builder()
                .userId(userId)
                .prompt(request.getPrompt())
                .sourceType(request.getSourceType())
                .sourceUrl(request.getSourceUrl())
                .slideCount(request.getSlideCount())
                .style(request.getStyle())
                .tone(request.getTone())
                .layout(request.getLayout())
                .templateId(request.getTemplateId())
                .status("GENERATING")
                .build();

        presentation = presentationRepository.save(presentation);
        log.info("Presentation created: {} for user {}", presentation.getId(), userId);

        // Generate slides with AI
        try {
            String userPrompt = String.format("""
                    Create a %d-slide presentation about: %s
                    Style: %s | Tone: %s | Layout: %s
                    Return JSON array of slides with fields: id, order, title, content, notes, layout
                    """,
                    request.getSlideCount(),
                    request.getPrompt(),
                    request.getStyle(),
                    request.getTone(),
                    request.getLayout()
            );

            AIRequest aiRequest = AIRequest.builder()
                    .systemPrompt(SYSTEM_PROMPT)
                    .userPrompt(userPrompt)
                    .temperature(0.7)
                    .maxTokens(4096)
                    .build();

            AIResponse aiResponse = aiOrchestrator.generate(aiRequest);

            // Parse slides from AI response (simplified — production would use Jackson)
            List<Presentation.Slide> slides = parseSlides(aiResponse.getContent(), request.getSlideCount());
            presentation.setSlides(slides);
            presentation.setTitle(extractTitle(request.getPrompt()));
            presentation.setStatus("COMPLETED");
            presentation.setSlideCount(slides.size());

            log.info("Presentation {} generated with {} slides via {}",
                    presentation.getId(), slides.size(), aiResponse.getProvider());

        } catch (Exception e) {
            log.error("Failed to generate presentation {}: {}", presentation.getId(), e.getMessage());
            presentation.setStatus("FAILED");
        }

        presentation = presentationRepository.save(presentation);
        return toResponse(presentation);
    }

    public Page<PresentationDto.ListResponse> list(String userId, int page, int size) {
        return presentationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toListResponse);
    }

    public PresentationDto.Response getById(String userId, String id) {
        Presentation presentation = presentationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presentation", id));
        return toResponse(presentation);
    }

    public void delete(String userId, String id) {
        presentationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presentation", id));
        presentationRepository.deleteByIdAndUserId(id, userId);
        log.info("Presentation {} deleted by user {}", id, userId);
    }

    public long count(String userId) {
        return presentationRepository.countByUserId(userId);
    }

    // ── Helpers ──────────────────────────────────────────────

    private List<Presentation.Slide> parseSlides(String content, int expectedCount) {
        // Simplified placeholder — real implementation would parse JSON from AI response
        // For now, create placeholder slides from the content
        return java.util.stream.IntStream.rangeClosed(1, Math.min(expectedCount, 15))
                .mapToObj(i -> Presentation.Slide.builder()
                        .id(UUID.randomUUID().toString())
                        .order(i)
                        .title("Slide " + i)
                        .content(content != null && content.length() > 100
                                ? content.substring(0, Math.min(200, content.length()))
                                : "Content for slide " + i)
                        .notes("Speaker notes for slide " + i)
                        .layout("default")
                        .build())
                .toList();
    }

    private String extractTitle(String prompt) {
        if (prompt == null) return "Untitled Presentation";
        return prompt.length() > 80 ? prompt.substring(0, 80) + "..." : prompt;
    }

    private PresentationDto.Response toResponse(Presentation p) {
        return PresentationDto.Response.builder()
                .id(p.getId())
                .title(p.getTitle())
                .prompt(p.getPrompt())
                .sourceType(p.getSourceType())
                .slideCount(p.getSlideCount())
                .style(p.getStyle())
                .tone(p.getTone())
                .status(p.getStatus())
                .version(p.getVersion())
                .slides(p.getSlides() != null ? p.getSlides().stream().map(s ->
                        PresentationDto.SlideResponse.builder()
                                .id(s.getId())
                                .order(s.getOrder())
                                .title(s.getTitle())
                                .content(s.getContent())
                                .notes(s.getNotes())
                                .imageUrl(s.getImageUrl())
                                .layout(s.getLayout())
                                .build()
                ).toList() : List.of())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private PresentationDto.ListResponse toListResponse(Presentation p) {
        return PresentationDto.ListResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .sourceType(p.getSourceType())
                .slideCount(p.getSlideCount())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
