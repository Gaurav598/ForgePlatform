package com.forgeai.resume.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * Resume analysis result — migrated from the existing Resume Analyzer's
 * Feedback structure (ATS, content, structure, skills, toneAndStyle scores + tips).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resume_analyses")
@CompoundIndex(name = "idx_user_created", def = "{'userId': 1, 'createdAt': -1}")
public class ResumeAnalysis {

    @Id
    private String id;

    @Indexed
    private String resumeId;

    private String userId;
    private String jobTitle;
    private String jobDescription;
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

    @CreatedDate
    private Instant createdAt;

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
        private String type;  // "good" or "improve"
        private String tip;
        private String explanation;
    }
}
