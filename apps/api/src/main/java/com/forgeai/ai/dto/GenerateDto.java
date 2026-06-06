package com.forgeai.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class GenerateDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateRequest {
        @NotBlank(message = "Prompt is required")
        @Size(max = 8000, message = "Prompt must be under 8000 characters")
        private String prompt;

        @Size(max = 2000, message = "System prompt must be under 2000 characters")
        private String systemPrompt;

        private Double temperature;
        private Integer maxTokens;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateResponse {
        private String content;
        private String provider;
        private Integer totalTokens;
        private Long latencyMs;
    }
}
