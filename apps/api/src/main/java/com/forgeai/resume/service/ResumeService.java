package com.forgeai.resume.service;

import com.forgeai.ai.dto.AIRequest;
import com.forgeai.ai.dto.AIResponse;
import com.forgeai.ai.service.AIOrchestrator;
import com.forgeai.common.exception.ResourceNotFoundException;
import com.forgeai.resume.dto.ResumeDto;
import com.forgeai.resume.model.Resume;
import com.forgeai.resume.model.ResumeAnalysis;
import com.forgeai.resume.repository.ResumeAnalysisRepository;
import com.forgeai.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository analysisRepository;
    private final AIOrchestrator aiOrchestrator;

    private static final String ANALYSIS_SYSTEM_PROMPT = """
            You are an expert career consultant and ATS specialist. Analyze the resume text provided and return a JSON object with:
            {
              "overallScore": <0-100>,
              "atsScore": { "score": <0-100>, "tips": [{"type": "good|improve", "tip": "...", "explanation": "..."}] },
              "contentScore": { "score": <0-100>, "tips": [...] },
              "structureScore": { "score": <0-100>, "tips": [...] },
              "skillsScore": { "score": <0-100>, "tips": [...] },
              "toneScore": { "score": <0-100>, "tips": [...] },
              "missingKeywords": ["keyword1", "keyword2"],
              "recommendations": ["recommendation1", "recommendation2"]
            }
            Be specific, actionable, and constructive. Return valid JSON only.
            """;

    public ResumeDto.ResumeResponse upload(String userId, MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        String fileType = originalName != null && originalName.endsWith(".docx") ? "DOCX" : "PDF";

        Resume resume = Resume.builder()
                .userId(userId)
                .title(originalName != null ? originalName : "Untitled Resume")
                .fileType(fileType)
                .filePath("uploads/" + userId + "/" + System.currentTimeMillis() + "_" + originalName)
                .build();

        resume = resumeRepository.save(resume);
        log.info("Resume uploaded: {} for user {}", resume.getId(), userId);

        return toResumeResponse(resume);
    }

    public ResumeDto.AnalysisResponse analyze(String userId, ResumeDto.AnalyzeRequest request) {
        Resume resume = resumeRepository.findByIdAndUserId(request.getResumeId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", request.getResumeId()));

        String userPrompt = buildAnalysisPrompt(resume, request);

        AIRequest aiRequest = AIRequest.builder()
                .systemPrompt(ANALYSIS_SYSTEM_PROMPT)
                .userPrompt(userPrompt)
                .temperature(0.3)
                .maxTokens(4096)
                .build();

        AIResponse aiResponse = aiOrchestrator.generate(aiRequest);

        // Build analysis record
        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .resumeId(resume.getId())
                .userId(userId)
                .jobTitle(request.getJobTitle())
                .jobDescription(request.getJobDescription())
                .companyName(request.getCompanyName())
                .overallScore(75) // Placeholder — would be parsed from AI response
                .atsScore(ResumeAnalysis.ScoreSection.builder().score(80).tips(List.of()).build())
                .contentScore(ResumeAnalysis.ScoreSection.builder().score(70).tips(List.of()).build())
                .structureScore(ResumeAnalysis.ScoreSection.builder().score(75).tips(List.of()).build())
                .skillsScore(ResumeAnalysis.ScoreSection.builder().score(72).tips(List.of()).build())
                .toneScore(ResumeAnalysis.ScoreSection.builder().score(78).tips(List.of()).build())
                .missingKeywords(List.of())
                .recommendations(List.of(
                        "Add more quantifiable achievements",
                        "Include relevant certifications",
                        "Optimize keyword density for ATS"
                ))
                .aiProvider(aiResponse.getProvider())
                .build();

        analysis = analysisRepository.save(analysis);
        log.info("Resume {} analyzed with score {} via {}",
                resume.getId(), analysis.getOverallScore(), aiResponse.getProvider());

        return toAnalysisResponse(analysis);
    }

    public Page<ResumeDto.ResumeResponse> listResumes(String userId, int page, int size) {
        return resumeRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toResumeResponse);
    }

    public List<ResumeDto.AnalysisResponse> getAnalyses(String userId, String resumeId) {
        // Verify ownership
        resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));

        return analysisRepository.findByResumeIdOrderByCreatedAtDesc(resumeId)
                .stream()
                .map(this::toAnalysisResponse)
                .toList();
    }

    public long countResumes(String userId) {
        return resumeRepository.countByUserId(userId);
    }

    public long countAnalyses(String userId) {
        return analysisRepository.countByUserId(userId);
    }

    // ── Helpers ──────────────────────────────────────────────

    private String buildAnalysisPrompt(Resume resume, ResumeDto.AnalyzeRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Analyze this resume:\n\n");
        sb.append("Resume Title: ").append(resume.getTitle()).append("\n");

        if (request.getJobTitle() != null) {
            sb.append("Target Job: ").append(request.getJobTitle()).append("\n");
        }
        if (request.getCompanyName() != null) {
            sb.append("Target Company: ").append(request.getCompanyName()).append("\n");
        }
        if (request.getJobDescription() != null) {
            sb.append("Job Description: ").append(request.getJobDescription()).append("\n");
        }

        return sb.toString();
    }

    private ResumeDto.ResumeResponse toResumeResponse(Resume r) {
        return ResumeDto.ResumeResponse.builder()
                .id(r.getId())
                .title(r.getTitle())
                .fileType(r.getFileType())
                .isBuilderCreated(r.isBuilderCreated())
                .templateId(r.getTemplateId())
                .version(r.getVersion())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private ResumeDto.AnalysisResponse toAnalysisResponse(ResumeAnalysis a) {
        return ResumeDto.AnalysisResponse.builder()
                .id(a.getId())
                .resumeId(a.getResumeId())
                .jobTitle(a.getJobTitle())
                .companyName(a.getCompanyName())
                .overallScore(a.getOverallScore())
                .atsScore(mapScoreSection(a.getAtsScore()))
                .contentScore(mapScoreSection(a.getContentScore()))
                .structureScore(mapScoreSection(a.getStructureScore()))
                .skillsScore(mapScoreSection(a.getSkillsScore()))
                .toneScore(mapScoreSection(a.getToneScore()))
                .missingKeywords(a.getMissingKeywords())
                .recommendations(a.getRecommendations())
                .aiProvider(a.getAiProvider())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private ResumeDto.ScoreSection mapScoreSection(ResumeAnalysis.ScoreSection s) {
        if (s == null) return null;
        return ResumeDto.ScoreSection.builder()
                .score(s.getScore())
                .tips(s.getTips() != null ? s.getTips().stream().map(t ->
                        ResumeDto.Tip.builder()
                                .type(t.getType())
                                .tip(t.getTip())
                                .explanation(t.getExplanation())
                                .build()
                ).toList() : List.of())
                .build();
    }
}
