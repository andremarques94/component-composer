import type { LLMClient, LLMConfig } from "@/types/llm";

export class OllamaClient implements LLMClient {
	private baseUrl: string;
	private model: string;

	constructor(config: LLMConfig) {
		this.baseUrl = config.baseUrl || "http://localhost:11434";
		this.model = config.model || "gpt-oss:120b-cloud";
	}

	async generate(params: {
		prompt: string;
		systemPrompt: string;
		stream?: boolean;
	}): Promise<ReadableStream | string> {
		const response = await fetch(`${this.baseUrl}/api/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: this.model,
				prompt: `${params.systemPrompt}\n\nUser: ${params.prompt}`,
				stream: params.stream ?? true,
			}),
		});

		if (!response.ok) {
			throw new Error(`Ollama request failed: ${response.statusText}`);
		}

		if (params.stream) {
			if (!response.body) {
				throw new Error("Response body is null");
			}
			return response.body;
		}

		const data = await response.json();
		return data.response;
	}
}
