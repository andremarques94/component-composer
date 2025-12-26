import { describe, expect, it } from "vitest";
import type { DesignTokens } from "@/types/design-system";
import {
	generateMUITheme,
	generateThemeProvider,
} from "./theme-provider-generator";

describe("generateMUITheme", () => {
	it("should generate theme with palette", () => {
		const tokens: DesignTokens = {
			colors: {
				primary: "#1976d2",
				secondary: "#dc004e",
			},
			spacing: {},
			typography: {},
		};

		const result = generateMUITheme(tokens);

		expect(result).toContain("import { createTheme }");
		expect(result).toContain("palette:");
		expect(result).toContain("primary:");
		expect(result).toContain("#1976d2");
		expect(result).toContain("#dc004e");
	});

	it("should generate theme with typography", () => {
		const tokens: DesignTokens = {
			colors: {},
			spacing: {},
			typography: {
				fontSize: "16px",
				fontFamily: '"Inter", sans-serif',
			},
		};

		const result = generateMUITheme(tokens);

		expect(result).toContain("typography:");
		expect(result).toContain("fontSize: 16");
		expect(result).toContain('fontFamily: \'"Inter", sans-serif\'');
	});

	it("should generate theme with spacing", () => {
		const tokens: DesignTokens = {
			colors: {},
			spacing: {
				unit: "8px",
			},
			typography: {},
		};

		const result = generateMUITheme(tokens);

		expect(result).toContain("spacing: 8");
	});

	it("should use default values when tokens are missing", () => {
		const tokens: DesignTokens = {
			colors: {},
			spacing: {},
			typography: {},
		};

		const result = generateMUITheme(tokens);

		expect(result).toContain("createTheme({");
	});

	it("should handle empty tokens gracefully", () => {
		const tokens: DesignTokens = {
			colors: {},
			spacing: {},
			typography: {},
		};

		const result = generateMUITheme(tokens);

		expect(result).toContain("import { createTheme }");
		expect(result).toContain("createTheme({");
	});

	it("should generate components overrides when colors exist", () => {
		const tokens: DesignTokens = {
			colors: { primary: "#1976d2" },
			spacing: {},
			typography: {},
		};

		const result = generateMUITheme(tokens);

		expect(result).toContain("components:");
		expect(result).toContain("MuiButton:");
		expect(result).toContain("MuiCard:");
	});
});

describe("generateThemeProvider", () => {
	it("should generate theme provider wrapper", () => {
		const result = generateThemeProvider(
			{ colors: {}, spacing: {}, typography: {} },
			{ approach: "mui-sx", patterns: [], imports: [] },
		);

		expect(result).toContain("import { ThemeProvider }");
		expect(result).toContain("const theme = createTheme");
		expect(result).toContain("AppThemeProvider");
		expect(result).toContain("<ThemeProvider theme={theme}>");
	});
});
