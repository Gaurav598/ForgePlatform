package com.forgeai.ai.provider;

import com.forgeai.ai.dto.AIRequest;
import com.forgeai.ai.dto.AIResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiProvider implements AIProvider {

    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private static final String DEFAULT_MODEL = "gemini-2.0-flash";

    @Value("${GEMINI_API_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String getName() {
        return "gemini";
    }

    @Override
    public int getPriority() {
        return 2;
    }

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(apiKey);
    }

    @Override
    public double getCostPer1kTokens() {
        return 0.001;
    }

    @Override
    public AIResponse generate(AIRequest request) {
        String model = request.getModel() != null ? request.getModel() : DEFAULT_MODEL;
        String url = String.format(API_URL, model, apiKey);

        StringBuilder textContent = new StringBuilder();
        if (request.getSystemPrompt() != null) {
            textContent.append("[System]: ").append(request.getSystemPrompt()).append("\n\n");
        }
        if (request.getUserPrompt() != null) {
            textContent.append(request.getUserPrompt());
        }

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", textContent.toString())
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", request.getTemperature(),
                        "maxOutputTokens", request.getMaxTokens()
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
        ).getBody();

        if (response == null) {
            throw new RuntimeException("Empty response from Gemini");
        }

        @SuppressWarnings("unchecked")
        var candidates = (List<Map<String, Object>>) response.get("candidates");
        @SuppressWarnings("unchecked")
        var content = (Map<String, Object>) candidates.get(0).get("content");
        @SuppressWarnings("unchecked")
        var parts = (List<Map<String, Object>>) content.get("parts");
        String text = (String) parts.get(0).get("text");

        @SuppressWarnings("unchecked")
        var usageMetadata = (Map<String, Object>) response.getOrDefault("usageMetadata", Map.of());
        int promptTokens = usageMetadata.containsKey("promptTokenCount")
                ? ((Number) usageMetadata.get("promptTokenCount")).intValue() : 0;
        int completionTokens = usageMetadata.containsKey("candidatesTokenCount")
                ? ((Number) usageMetadata.get("candidatesTokenCount")).intValue() : 0;

        return AIResponse.builder()
                .content(text)
                .model(model)
                .provider("gemini")
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .totalTokens(promptTokens + completionTokens)
                .estimatedCost((promptTokens + completionTokens) * getCostPer1kTokens() / 1000)
                .build();
    }
}
