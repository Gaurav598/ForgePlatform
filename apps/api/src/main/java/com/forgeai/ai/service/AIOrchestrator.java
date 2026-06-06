package com.forgeai.ai.service;

import com.forgeai.ai.dto.AIRequest;
import com.forgeai.ai.dto.AIResponse;
import com.forgeai.ai.provider.AIProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * AI Orchestrator — routes requests through providers with automatic fallback.
 *
 * Priority order: Groq (1) → Gemini (2) → OpenAI (3) → Claude (4)
 * If a provider fails, the next one in priority is tried.
 * Includes retry logic with exponential backoff.
 */
@Slf4j
@Service
public class AIOrchestrator {

    private final List<AIProvider> providers;
    private static final int MAX_RETRIES = 2;

    public AIOrchestrator(List<AIProvider> providers) {
        // Sort by priority (lowest number = highest priority)
        this.providers = providers.stream()
                .sorted(Comparator.comparingInt(AIProvider::getPriority))
                .toList();

        log.info("AI Orchestrator initialized with {} providers: {}",
                providers.size(),
                providers.stream().map(p -> p.getName() + "(priority=" + p.getPriority() + ")").toList()
        );
    }

    /**
     * Generate a completion, automatically falling back through providers.
     */
    public AIResponse generate(AIRequest request) {
        for (AIProvider provider : providers) {
            if (!provider.isAvailable()) {
                log.debug("Skipping provider {} — not available", provider.getName());
                continue;
            }

            for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                try {
                    log.debug("Attempting generation with {} (attempt {})", provider.getName(), attempt + 1);
                    long startTime = System.currentTimeMillis();

                    AIResponse response = provider.generate(request);

                    long latency = System.currentTimeMillis() - startTime;
                    response.setLatencyMs(latency);
                    response.setProvider(provider.getName());

                    log.info("AI generation successful: provider={}, tokens={}, latency={}ms",
                            provider.getName(), response.getTotalTokens(), latency);

                    return response;

                } catch (Exception e) {
                    log.warn("Provider {} failed (attempt {}): {}",
                            provider.getName(), attempt + 1, e.getMessage());

                    if (attempt < MAX_RETRIES) {
                        try {
                            long backoff = (long) Math.pow(2, attempt) * 500;
                            Thread.sleep(backoff);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("AI generation interrupted", ie);
                        }
                    }
                }
            }

            log.warn("All retries exhausted for provider {}, trying next", provider.getName());
        }

        throw new RuntimeException("All AI providers failed. Please try again later.");
    }

    /**
     * Generate with a specific provider (for testing/debugging)
     */
    public AIResponse generateWith(String providerName, AIRequest request) {
        AIProvider provider = providers.stream()
                .filter(p -> p.getName().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown provider: " + providerName));

        if (!provider.isAvailable()) {
            throw new RuntimeException("Provider " + providerName + " is not available");
        }

        long startTime = System.currentTimeMillis();
        AIResponse response = provider.generate(request);
        response.setLatencyMs(System.currentTimeMillis() - startTime);
        response.setProvider(provider.getName());
        return response;
    }

    /**
     * List all available providers and their status
     */
    public List<ProviderStatus> getProviderStatuses() {
        return providers.stream()
                .map(p -> new ProviderStatus(
                        p.getName(),
                        p.getPriority(),
                        p.isAvailable(),
                        p.getCostPer1kTokens()
                ))
                .toList();
    }

    public record ProviderStatus(String name, int priority, boolean available, double costPer1kTokens) {}
}
