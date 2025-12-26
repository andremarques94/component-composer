import { z } from "zod";

// Zod schemas for runtime validation
export const ComponentInfoSchema = z.object({
	name: z.string(),
	path: z.string(),
	props: z.array(
		z.object({
			name: z.string(),
			type: z.string(),
			required: z.boolean(),
			defaultValue: z.string().optional(),
		}),
	),
	examples: z.array(z.string()),
});

export const DesignTokensSchema = z.object({
	colors: z.record(z.string(), z.string()),
	spacing: z.record(z.string(), z.string()),
	typography: z.record(z.string(), z.string()),
	breakpoints: z.record(z.string(), z.string()).optional(),
});

export const StylingInfoSchema = z.object({
	approach: z.enum([
		"mui-sx",
		"mui-styled",
		"emotion",
		"styled-components",
		"css-modules",
		"tailwind",
		"chakra",
		"mantine",
		"ant-design",
	]),
	patterns: z.array(z.string()),
	imports: z.array(z.string()),
	themeProvider: z.string().optional(),
});

export const DesignSystemContextSchema = z.object({
	components: z.array(ComponentInfoSchema),
	tokens: DesignTokensSchema,
	styling: StylingInfoSchema,
	conventions: z.object({
		componentPrefix: z.string().optional(),
		propPatterns: z.array(z.string()),
		fileStructure: z.string(),
	}),
	examples: z.array(
		z.object({
			component: z.string(),
			usage: z.string(),
		}),
	),
});

// TypeScript types inferred from Zod schemas
export type ComponentInfo = z.infer<typeof ComponentInfoSchema>;
export type DesignTokens = z.infer<typeof DesignTokensSchema>;
export type StylingInfo = z.infer<typeof StylingInfoSchema>;
export type DesignSystemContext = z.infer<typeof DesignSystemContextSchema>;

// Helper type for component props
export interface ComponentProp {
	name: string;
	type: string;
	required: boolean;
	defaultValue?: string;
}

// Helper type for design system examples
export interface DesignSystemExample {
	component: string;
	usage: string;
}

// Preview-related types
export interface PreviewConfig {
	dependencies: Record<string, string>;
	template: "react" | "react-ts";
	themeProvider?: string;
}

export interface CodeExtractionResult {
	code: string;
	hasDefaultExport: boolean;
	imports: string[];
	componentName?: string;
}
