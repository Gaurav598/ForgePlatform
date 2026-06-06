package com.forgeai.ai.provider;

import com.forgeai.ai.dto.AIRequest;
import com.forgeai.ai.dto.AIResponse;

/**
 * Abstraction layer for AI providers.
 * Each provider (Groq, Gemini, OpenAI, Claude) implements this interface.
 */
public interface AIProvider {

    /**
     * Provider name (e.g., "groq", "gemini", "openai", "claude")
     */
    String getName();

    /**
     * Priority order — lower is higher priority.
     * Groq=1, Gemini=2, OpenAI=3, Claude=4
     */
    int getPriority();

    /**
     * Check if the provider is available (API key configured, not rate-limited)
     */
    boolean isAvailable();

    /**
     * Generate a completion from the AI model
     */
    AIResponse generate(AIRequest request);

    /**
     * Estimated cost per 1K tokens (for cost monitoring)
     */
    double getCostPer1kTokens();
}
