import type { LLMClient, LLMConfig } from "@/types/llm";
import { OllamaClient } from "./providers/ollama";

// Placeholder classes for Anthropic and OpenAI - will implement if needed
class AnthropicClient implements LLMClient {
	// biome-ignore lint/complexity/noUselessConstructor: Placeholder for future implementation
	constructor(_config: LLMConfig) {
		// TODO: Store config for implementation
	}

	async generate(_params: {
		prompt: string;
		systemPrompt: string;
		stream?: boolean;
	}): Promise<ReadableStream | string> {
		throw new Error("Anthropic client not yet implemented");
	}
}

class OpenAIClient implements LLMClient {
	// biome-ignore lint/complexity/noUselessConstructor: Placeholder for future implementation
	constructor(_config: LLMConfig) {
		// TODO: Store config for implementation
	}

	async generate(_params: {
		prompt: string;
		systemPrompt: string;
		stream?: boolean;
	}): Promise<ReadableStream | string> {
		throw new Error("OpenAI client not yet implemented");
	}
}

export function createLLMClient(config: LLMConfig): LLMClient {
	switch (config.provider) {
		case "ollama":
			return new OllamaClient(config);
		case "anthropic":
			return new AnthropicClient(config);
		case "openai":
			return new OpenAIClient(config);
		default:
			throw new Error(`Unknown LLM provider: ${config.provider}`);
	}
}

// Helper to get config from environment
export function getLLMConfigFromEnv(): LLMConfig {
	const provider = (process.env.LLM_PROVIDER ||
		"ollama") as LLMConfig["provider"];

	return {
		provider,
		apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
		baseUrl: process.env.OLLAMA_HOST,
		model: process.env.OLLAMA_MODEL,
	};
}
