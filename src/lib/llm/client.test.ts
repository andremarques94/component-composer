import { describe, expect, it, vi } from "vitest";
import { createLLMClient, getLLMConfigFromEnv } from "./client";

describe("createLLMClient", () => {
	it("should create Ollama client", () => {
		const client = createLLMClient({
			provider: "ollama",
			baseUrl: "http://localhost:11434",
		});

		expect(client).toBeDefined();
		expect(client.generate).toBeDefined();
	});

	it("should create Anthropic client", () => {
		const client = createLLMClient({
			provider: "anthropic",
			apiKey: "test-key",
		});

		expect(client).toBeDefined();
	});

	it("should create OpenAI client", () => {
		const client = createLLMClient({
			provider: "openai",
			apiKey: "test-key",
		});

		expect(client).toBeDefined();
	});

	it("should throw on unknown provider", () => {
		expect(() =>
			createLLMClient({
				provider: "unknown" as any,
			}),
		).toThrow("Unknown LLM provider");
	});
});

describe("getLLMConfigFromEnv", () => {
	it("should default to ollama", () => {
		const originalEnv = process.env.LLM_PROVIDER;
		delete process.env.LLM_PROVIDER;

		const config = getLLMConfigFromEnv();
		expect(config.provider).toBe("ollama");

		if (originalEnv) process.env.LLM_PROVIDER = originalEnv;
	});

	it("should read from environment variables", () => {
		const originalProvider = process.env.LLM_PROVIDER;
		const originalKey = process.env.ANTHROPIC_API_KEY;

		process.env.LLM_PROVIDER = "anthropic";
		process.env.ANTHROPIC_API_KEY = "test-key";

		const config = getLLMConfigFromEnv();

		expect(config.provider).toBe("anthropic");
		expect(config.apiKey).toBe("test-key");

		if (originalProvider) process.env.LLM_PROVIDER = originalProvider;
		else delete process.env.LLM_PROVIDER;
		if (originalKey) process.env.ANTHROPIC_API_KEY = originalKey;
		else delete process.env.ANTHROPIC_API_KEY;
	});
});
