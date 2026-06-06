package com.forgeai.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRequest {

    private String model;
    private String systemPrompt;
    private String userPrompt;
    private List<Message> messages;

    @Builder.Default
    private double temperature = 0.7;

    @Builder.Default
    private int maxTokens = 4096;

    private Map<String, Object> metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role;  // "system", "user", "assistant"
        private String content;
    }
}
