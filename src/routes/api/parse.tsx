import { createFileRoute } from "@tanstack/react-router";
import { parseStorybookUrl } from "@/lib/parsers/storybook-parser";
import { ParseRequestSchema } from "@/types/api";

export const Route = createFileRoute("/api/parse")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();
					const input = ParseRequestSchema.parse(body);

					// For v1, only support URL parsing
					if (!input.url) {
						return new Response(
							JSON.stringify({
								error: "URL is required (path parsing coming soon)",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const context = await parseStorybookUrl(input.url);

					return new Response(JSON.stringify(context), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					console.error("Parse error:", error);

					if (error instanceof Error) {
						return new Response(JSON.stringify({ error: error.message }), {
							status: 400,
							headers: { "Content-Type": "application/json" },
						});
					}

					return new Response(
						JSON.stringify({ error: "Failed to parse design system" }),
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
