import { describe, expect, it } from "vitest";
import { extractThemeTokens } from "./theme-extractor";

describe("extractThemeTokens", () => {
	it("should extract MUI color palette tokens", async () => {
		const result = await extractThemeTokens("http://localhost:9009");

		expect(result.colors).toBeDefined();
		expect(result.colors).toHaveProperty("primary");
		expect(result.colors).toHaveProperty("secondary");
		expect(result.colors).toHaveProperty("error");
		expect(result.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/); // Check for valid hex
	});

	it("should extract spacing scale", async () => {
		const result = await extractThemeTokens("http://localhost:9009");

		expect(result.spacing).toBeDefined();
		expect(result.spacing).toHaveProperty("xs");
		expect(result.spacing).toHaveProperty("md");
		expect(result.spacing.md).toMatch(/^\d+px$/); // Check for pixel value
	});

	it("should extract typography styles", async () => {
		const result = await extractThemeTokens("http://localhost:9009");

		expect(result.typography).toBeDefined();
		expect(result.typography).toHaveProperty("h1");
		expect(result.typography).toHaveProperty("fontSize"); // Updated expectation
		expect(result.typography.h1).toMatch(/rem|px/);
	});

	it("should include breakpoints", async () => {
		const result = await extractThemeTokens("http://localhost:9009");

		expect(result.breakpoints).toBeDefined();
		expect(result.breakpoints).toHaveProperty("xs");
		expect(result.breakpoints).toHaveProperty("md");
	});
});
