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
public class GroqProvider implements AIProvider {

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String DEFAULT_MODEL = "llama-3.3-70b-versatile";

    @Value("${GROQ_API_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String getName() {
        return "groq";
    }

    @Override
    public int getPriority() {
        return 1; // Highest priority
    }

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(apiKey);
    }

    @Override
    public double getCostPer1kTokens() {
        return 0.0005; // Very affordable
    }

    @Override
    public AIResponse generate(AIRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String model = request.getModel() != null ? request.getModel() : DEFAULT_MODEL;

        var messages = new java.util.ArrayList<Map<String, String>>();
        if (request.getSystemPrompt() != null) {
            messages.add(Map.of("role", "system", "content", request.getSystemPrompt()));
        }
        if (request.getUserPrompt() != null) {
            messages.add(Map.of("role", "user", "content", request.getUserPrompt()));
        }
        if (request.getMessages() != null) {
            for (AIRequest.Message msg : request.getMessages()) {
                messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
            }
        }

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "temperature", request.getTemperature(),
                "max_tokens", request.getMaxTokens()
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.exchange(
                API_URL, HttpMethod.POST, entity, Map.class
        ).getBody();

        if (response == null) {
            throw new RuntimeException("Empty response from Groq");
        }

        @SuppressWarnings("unchecked")
        var choices = (List<Map<String, Object>>) response.get("choices");
        @SuppressWarnings("unchecked")
        var message = (Map<String, Object>) choices.get(0).get("message");
        String content = (String) message.get("content");

        @SuppressWarnings("unchecked")
        var usage = (Map<String, Object>) response.get("usage");
        int promptTokens = usage != null ? ((Number) usage.getOrDefault("prompt_tokens", 0)).intValue() : 0;
        int completionTokens = usage != null ? ((Number) usage.getOrDefault("completion_tokens", 0)).intValue() : 0;

        return AIResponse.builder()
                .content(content)
                .model(model)
                .provider("groq")
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .totalTokens(promptTokens + completionTokens)
                .estimatedCost((promptTokens + completionTokens) * getCostPer1kTokens() / 1000)
                .build();
    }
}
