import type { DesignTokens } from "@/types/design-system";

/**
 * Extract theme tokens from Storybook
 * For MUI, this returns standard MUI theme token references
 * In the future, this could parse actual theme files from the repository
 */
export async function extractThemeTokens(
	_storybookUrl: string,
): Promise<DesignTokens> {
	// Return valid hex codes so the Preview environment can render the theme without crashing.
	// The LLM knows how to reference these as theme.palette.* via the system prompt.
	
	return {
		colors: {
			primary: "#1976d2",      // MUI Default Blue
			secondary: "#9c27b0",    // MUI Default Purple
			error: "#d32f2f",        // MUI Default Red
			warning: "#ed6c02",      // MUI Default Orange
			info: "#0288d1",         // MUI Default Light Blue
			success: "#2e7d32",      // MUI Default Green
			background: "#ffffff",
			paper: "#ffffff",
			text: "#000000",
			textSecondary: "#666666",
			divider: "#e0e0e0",
		},
		spacing: {
			xs: "4px",
			sm: "8px",
			md: "16px",
			lg: "24px",
			xl: "32px",
			"2xl": "48px",
			"3xl": "64px",
		},
		typography: {
			fontSize: "14px",
			fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
			h1: "2.125rem",
			h2: "1.75rem",
			h3: "1.5rem",
			h4: "1.25rem",
			h5: "1.125rem",
			h6: "1rem",
		},
		breakpoints: {
			xs: "0px",
			sm: "600px",
			md: "900px",
			lg: "1200px",
			xl: "1536px",
		},
	};
}
