package com.forgeai.presentation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

public class PresentationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Prompt or topic is required")
        @Size(max = 5000, message = "Prompt must not exceed 5000 characters")
        private String prompt;

        @Builder.Default
        private String sourceType = "PROMPT";

        private String sourceUrl;

        @Min(value = 3, message = "Minimum 3 slides")
        @Max(value = 30, message = "Maximum 30 slides")
        @Builder.Default
        private int slideCount = 10;

        @Builder.Default
        private String style = "minimal";

        @Builder.Default
        private String tone = "formal";

        @Builder.Default
        private String layout = "balanced";

        private String templateId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String title;
        private String prompt;
        private String sourceType;
        private int slideCount;
        private String style;
        private String tone;
        private String status;
        private int version;
        private List<SlideResponse> slides;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlideResponse {
        private String id;
        private int order;
        private String title;
        private String content;
        private String notes;
        private String imageUrl;
        private String layout;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListResponse {
        private String id;
        private String title;
        private String sourceType;
        private int slideCount;
        private String status;
        private Instant createdAt;
    }
}
