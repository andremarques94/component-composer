/**
 * LLM provider types and interfaces
 */

export interface LLMClient {
	/**
	 * Generate text/code using the LLM
	 * @param params Generation parameters
	 * @returns ReadableStream for streaming or string for non-streaming
	 */
	generate(params: {
		prompt: string;
		systemPrompt: string;
		stream?: boolean;
	}): Promise<ReadableStream | string>;
}

export type LLMProvider = "ollama" | "anthropic" | "openai";

export interface LLMConfig {
	provider: LLMProvider;
	apiKey?: string;
	baseUrl?: string;
	model?: string;
}

/**
 * Environment configuration for LLM providers
 */
export interface LLMEnvironmentConfig {
	LLM_PROVIDER?: string;
	OLLAMA_HOST?: string;
	OLLAMA_MODEL?: string;
	ANTHROPIC_API_KEY?: string;
	OPENAI_API_KEY?: string;
}

/**
 * LLM generation options
 */
export interface GenerationOptions {
	temperature?: number;
	maxTokens?: number;
	stopSequences?: string[];
}

/**
 * Streaming chunk from LLM
 */
export interface StreamChunk {
	text: string;
	done: boolean;
}
