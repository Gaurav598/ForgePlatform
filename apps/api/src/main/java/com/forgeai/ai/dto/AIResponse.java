package com.forgeai.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {

    private String content;
    private String model;
    private String provider;
    private int promptTokens;
    private int completionTokens;
    private int totalTokens;
    private long latencyMs;
    private double estimatedCost;
    private boolean fromCache;
}
