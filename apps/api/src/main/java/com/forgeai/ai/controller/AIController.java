package com.forgeai.ai.controller;

import com.forgeai.ai.dto.AIRequest;
import com.forgeai.ai.dto.AIResponse;
import com.forgeai.ai.dto.GenerateDto;
import com.forgeai.ai.service.AIOrchestrator;
import com.forgeai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "Generic AI text generation endpoint")
public class AIController {

    private final AIOrchestrator aiOrchestrator;

    @PostMapping("/generate")
    @Operation(summary = "Generate AI text content")
    public ResponseEntity<ApiResponse<GenerateDto.GenerateResponse>> generate(
            @Valid @RequestBody GenerateDto.GenerateRequest request) {

        AIRequest aiRequest = AIRequest.builder()
                .systemPrompt(request.getSystemPrompt())
                .userPrompt(request.getPrompt())
                .temperature(request.getTemperature() != null ? request.getTemperature() : 0.7)
                .maxTokens(request.getMaxTokens() != null ? request.getMaxTokens() : 2048)
                .build();

        AIResponse aiResponse = aiOrchestrator.generate(aiRequest);

        GenerateDto.GenerateResponse response = GenerateDto.GenerateResponse.builder()
                .content(aiResponse.getContent())
                .provider(aiResponse.getProvider())
                .totalTokens(aiResponse.getTotalTokens())
                .latencyMs(aiResponse.getLatencyMs())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Generated successfully", response));
    }
}
