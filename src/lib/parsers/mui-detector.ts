import type { StylingInfo } from "@/types/design-system";

/**
 * Detect MUI patterns from component code
 * Looks for:
 * - sx prop usage
 * - styled() API from @mui/material/styles
 * - Theme tokens (theme.palette, theme.spacing)
 * - Lichtblick ThemeProvider
 */
export function detectMUIPatterns(code: string): StylingInfo {
	const patterns: string[] = [];
	const imports: string[] = [];
	let themeProvider: string | undefined;

	// Detect sx prop pattern
	if (code.includes("sx={{") || code.includes("sx={")) {
		patterns.push("Uses sx prop for styling");
	}

	// Detect styled API
	if (code.includes("styled(") && code.includes("@mui/material/styles")) {
		patterns.push("Uses MUI styled() API");
		imports.push("import { styled } from '@mui/material/styles';");
	}

	// Detect theme usage
	if (code.includes("theme.palette") || code.includes("theme.spacing")) {
		patterns.push("Uses MUI theme tokens");
	}

	// Detect Lichtblick ThemeProvider
	if (code.includes("ThemeProvider")) {
		themeProvider = "ThemeProvider";
	}

	// Determine primary approach (prefer styled over sx if both present)
	const approach =
		code.includes("styled(") && code.includes("@mui/material/styles")
			? "mui-styled"
			: "mui-sx";

	return {
		approach,
		patterns,
		imports,
		themeProvider,
	};
}
