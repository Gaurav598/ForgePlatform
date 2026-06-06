package com.forgeai.presentation.model;

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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "presentations")
@CompoundIndex(name = "idx_user_created", def = "{'userId': 1, 'createdAt': -1}")
public class Presentation {

    @Id
    private String id;

    private String userId;
    private String title;
    private String prompt;

    @Builder.Default
    private String sourceType = "PROMPT"; // PROMPT, PDF, DOCX, YOUTUBE, URL, NOTES

    private String sourceUrl;
    private int slideCount;

    @Builder.Default
    private String style = "minimal";

    @Builder.Default
    private String tone = "formal";

    @Builder.Default
    private String layout = "balanced";

    private String templateId;

    @Builder.Default
    private String status = "DRAFT"; // DRAFT, GENERATING, COMPLETED, FAILED

    @Builder.Default
    private int version = 1;

    private List<Slide> slides;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Slide {
        private String id;
        private int order;
        private String title;
        private String content;
        private String notes;
        private String imageUrl;
        private String imagePrompt;
        private String layout;
    }
}
