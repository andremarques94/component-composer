import { createFileRoute } from "@tanstack/react-router";
import { createLLMClient, getLLMConfigFromEnv } from "@/lib/llm/client";
import { buildSystemPrompt } from "@/lib/llm/prompts";
import { GenerateRequestSchema } from "@/types/api";

export const Route = createFileRoute("/api/generate")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();
					const input = GenerateRequestSchema.parse(body);

					const llmConfig = getLLMConfigFromEnv();
					const llmClient = createLLMClient(llmConfig);

					const systemPrompt = buildSystemPrompt(input.designSystemContext);

					const stream = await llmClient.generate({
						prompt: input.prompt,
						systemPrompt,
						stream: true,
					});

					// Return streaming response
					return new Response(stream as ReadableStream, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
						},
					});
				} catch (error) {
					console.error("Generation error:", error);

					if (error instanceof Error) {
						return new Response(JSON.stringify({ error: error.message }), {
							status: 400,
							headers: { "Content-Type": "application/json" },
						});
					}

					return new Response(
						JSON.stringify({ error: "Failed to generate component" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
