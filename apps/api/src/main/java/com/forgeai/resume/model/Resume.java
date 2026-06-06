package com.forgeai.resume.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resumes")
@CompoundIndex(name = "idx_user_created", def = "{'userId': 1, 'createdAt': -1}")
public class Resume {

    @Id
    private String id;

    private String userId;
    private String title;
    private String filePath;

    @Builder.Default
    private String fileType = "PDF"; // PDF, DOCX

    private String thumbnailPath;

    private ParsedData parsedData;

    @Builder.Default
    private int version = 1;

    @Builder.Default
    private boolean isBuilderCreated = false;

    private String templateId;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParsedData {
        private Map<String, String> personalInfo;
        private String summary;
        private List<Experience> experience;
        private List<Education> education;
        private List<String> skills;
        private List<Certification> certifications;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Experience {
        private String company;
        private String title;
        private String startDate;
        private String endDate;
        private String description;
        private List<String> highlights;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Education {
        private String institution;
        private String degree;
        private String field;
        private String startDate;
        private String endDate;
        private String gpa;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Certification {
        private String name;
        private String issuer;
        private String date;
    }
}
