package com.forgeai.resume.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

public class ResumeDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyzeRequest {
        @NotBlank(message = "Resume ID is required")
        private String resumeId;
        private String jobTitle;
        private String jobDescription;
        private String companyName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeResponse {
        private String id;
        private String title;
        private String fileType;
        private boolean isBuilderCreated;
        private String templateId;
        private int version;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalysisResponse {
        private String id;
        private String resumeId;
        private String jobTitle;
        private String companyName;
        private int overallScore;
        private ScoreSection atsScore;
        private ScoreSection contentScore;
        private ScoreSection structureScore;
        private ScoreSection skillsScore;
        private ScoreSection toneScore;
        private List<String> missingKeywords;
        private List<String> recommendations;
        private String aiProvider;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreSection {
        private int score;
        private List<Tip> tips;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Tip {
        private String type;
        private String tip;
        private String explanation;
    }
}
