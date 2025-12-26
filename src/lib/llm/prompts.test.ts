import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./prompts";
import type { DesignSystemContext } from "@/types/design-system";

describe("buildSystemPrompt", () => {
	it("should include design system context", () => {
		const context: DesignSystemContext = {
			components: [
				{
					name: "Button",
					path: "/components/Button.tsx",
					props: [{ name: "variant", type: "string", required: false }],
					examples: [],
				},
			],
			tokens: {
				colors: { primary: "theme.palette.primary.main" },
				spacing: { md: "theme.spacing(2)" },
				typography: { h1: "theme.typography.h1" },
			},
			styling: {
				approach: "mui-sx",
				patterns: ["Uses sx prop"],
				imports: [],
			},
			conventions: {
				propPatterns: ["variant", "size"],
				fileStructure: "PascalCase",
			},
			examples: [],
		};

		const prompt = buildSystemPrompt(context);

		expect(prompt).toContain("Material-UI (MUI)");
		expect(prompt).toContain("mui-sx");
		expect(prompt).toContain("Button");
		expect(prompt).toContain("primary"); // Token key is mentioned
	});

	it("should include MUI-specific instructions for mui-styled", () => {
		const context: DesignSystemContext = {
			components: [],
			tokens: { colors: {}, spacing: {}, typography: {} },
			styling: {
				approach: "mui-styled",
				patterns: [],
				imports: [],
			},
			conventions: { propPatterns: [], fileStructure: "" },
			examples: [],
		};

		const prompt = buildSystemPrompt(context);

		expect(prompt).toContain("styled() API");
	});

	it("should include component examples when available", () => {
		const context: DesignSystemContext = {
			components: [],
			tokens: { colors: {}, spacing: {}, typography: {} },
			styling: {
				approach: "mui-sx",
				patterns: [],
				imports: [],
			},
			conventions: { propPatterns: [], fileStructure: "" },
			examples: [
				{
					component: "ExampleComponent",
					usage: "const Example = () => <Box />",
				},
			],
		};

		const prompt = buildSystemPrompt(context);

		expect(prompt).toContain("ExampleComponent");
		expect(prompt).toContain("const Example = () => <Box />");
	});

	it("should list available components", () => {
		const context: DesignSystemContext = {
			components: [
				{
					name: "Button",
					path: "",
					props: [
						{ name: "variant", type: "string", required: false },
						{ name: "size", type: "string", required: false },
					],
					examples: [],
				},
				{
					name: "Card",
					path: "",
					props: [{ name: "elevation", type: "number", required: false }],
					examples: [],
				},
			],
			tokens: { colors: {}, spacing: {}, typography: {} },
			styling: {
				approach: "mui-sx",
				patterns: [],
				imports: [],
			},
			conventions: { propPatterns: [], fileStructure: "" },
			examples: [],
		};

		const prompt = buildSystemPrompt(context);

		expect(prompt).toContain("Button");
		expect(prompt).toContain("variant");
		expect(prompt).toContain("Card");
		expect(prompt).toContain("elevation");
	});
});
