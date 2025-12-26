import { beforeEach, describe, expect, it, vi } from "vitest";
import { OllamaClient } from "./ollama";

describe("OllamaClient", () => {
	let client: OllamaClient;

	beforeEach(() => {
		client = new OllamaClient({
			provider: "ollama",
			baseUrl: "http://localhost:11434",
			model: "gemma3:4b",
		});

		global.fetch = vi.fn();
	});

	it("should generate streaming response", async () => {
		const mockStream = new ReadableStream({
			start(controller) {
				controller.enqueue(new TextEncoder().encode('{"response":"test"}'));
				controller.close();
			},
		});

		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			body: mockStream,
		});

		const result = await client.generate({
			prompt: "test prompt",
			systemPrompt: "system prompt",
			stream: true,
		});

		expect(result).toBeInstanceOf(ReadableStream);
		expect(global.fetch).toHaveBeenCalledWith(
			"http://localhost:11434/api/generate",
			expect.objectContaining({
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}),
		);
	});

	it("should generate non-streaming response", async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ response: "Generated code here" }),
		});

		const result = await client.generate({
			prompt: "test prompt",
			systemPrompt: "system prompt",
			stream: false,
		});

		expect(typeof result).toBe("string");
		expect(result).toBe("Generated code here");
	});

	it("should handle Ollama errors gracefully", async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			statusText: "Internal Server Error",
		});

		await expect(
			client.generate({
				prompt: "test",
				systemPrompt: "system",
			}),
		).rejects.toThrow("Ollama request failed");
	});

	it("should include model in request", async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ response: "test" }),
		});

		await client.generate({
			prompt: "test",
			systemPrompt: "system",
			stream: false,
		});

		const callArgs = (global.fetch as any).mock.calls[0][1];
		const body = JSON.parse(callArgs.body);

		expect(body.model).toBe("gemma3:4b");
	});

	it("should combine system and user prompts", async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ response: "test" }),
		});

		await client.generate({
			prompt: "user prompt",
			systemPrompt: "system prompt",
			stream: false,
		});

		const callArgs = (global.fetch as any).mock.calls[0][1];
		const body = JSON.parse(callArgs.body);

		expect(body.prompt).toContain("system prompt");
		expect(body.prompt).toContain("user prompt");
	});
});
