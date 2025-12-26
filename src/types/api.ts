import { z } from "zod";
import { DesignSystemContextSchema } from "./design-system";

// Parse API request/response schemas
export const ParseRequestSchema = z
	.object({
		url: z.string().url().optional(),
		path: z.string().optional(),
	})
	.refine((data) => data.url || data.path, {
		message: "Either url or path must be provided",
	});

export const ParseResponseSchema = DesignSystemContextSchema;

// Generate API request/response schemas
export const GenerateRequestSchema = z.object({
	prompt: z.string().min(1, "Prompt cannot be empty"),
	designSystemContext: DesignSystemContextSchema,
});

export const GenerateResponseSchema = z.object({
	code: z.string(),
});

// TypeScript types inferred from schemas
export type ParseRequest = z.infer<typeof ParseRequestSchema>;
export type ParseResponse = z.infer<typeof ParseResponseSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

// Error response type
export interface APIError {
	error: string;
	details?: string;
}
