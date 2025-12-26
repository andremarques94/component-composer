import type { DesignTokens, StylingInfo } from "@/types/design-system";

/**
 * Generate theme provider code based on design system
 * Currently supports MUI v7, extensible for other frameworks
 */

/**
 * Generate MUI v7 theme from design tokens
 * Returns string containing theme definition code
 */
export function generateMUITheme(tokens: DesignTokens): string {
	const themeCode = `
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	${generatePalette(tokens.colors)}
	${generateTypography(tokens.typography)}
	${generateSpacing(tokens.spacing)}
	${generateComponents(tokens.colors)}
});
`;

	return themeCode.trim();
}

/**
 * Generate palette from color tokens
 */
function generatePalette(colors: Record<string, string>): string {
	if (Object.keys(colors).length === 0) {
		return "";
	}

	const primary = colors.primary || "#1976d2";
	const secondary = colors.secondary || "#dc004e";
	const error = colors.error || "#d32f2f";
	const warning = colors.warning || "#ed6c02";
	const info = colors.info || "#0288d1";
	const success = colors.success || "#2e7d32";

	return `
	palette: {
		primary: {
			main: '${primary}',
			light: '${lightenColor(primary, 20)}',
			dark: '${darkenColor(primary, 20)}',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '${secondary}',
			light: '${lightenColor(secondary, 20)}',
			dark: '${darkenColor(secondary, 20)}',
			contrastText: '#ffffff',
		},
		error: {
			main: '${error}',
		},
		warning: {
			main: '${warning}',
		},
		info: {
			main: '${info}',
		},
		success: {
			main: '${success}',
		},
		background: {
			default: '#ffffff',
			paper: '${colors.background || "#ffffff"}',
		},
		text: {
			primary: '${colors.text || "#000000"}',
			secondary: '${colors.textSecondary || "#666666"}',
		},
	},
`;
}

/**
 * Generate typography from tokens
 */
function generateTypography(typography: Record<string, string>): string {
	if (Object.keys(typography).length === 0) {
		return "";
	}

	const fontSizeValue = typography.fontSize || "14";
	const fontSizeNumeric = Number.parseInt(fontSizeValue.replace("px", ""), 10) || 14;
	const fontFamilyValue =
		typography.fontFamily || '"Roboto", "Helvetica", "Arial", sans-serif';

	return `
	typography: {
		fontFamily: '${fontFamilyValue.replace(/'/g, "\\'")}',
		fontSize: ${fontSizeNumeric},
		h1: { fontSize: '2.125rem', fontWeight: 300 },
		h2: { fontSize: '1.75rem', fontWeight: 300 },
		h3: { fontSize: '1.5rem', fontWeight: 400 },
		h4: { fontSize: '1.25rem', fontWeight: 400 },
		h5: { fontSize: '1.125rem', fontWeight: 500 },
		h6: { fontSize: '1rem', fontWeight: 500 },
		body1: { fontSize: ${fontSizeNumeric} },
		body2: { fontSize: ${fontSizeNumeric}, color: 'rgba(0, 0, 0, 0.7)' },
		subtitle1: { fontSize: '0.875rem', fontWeight: 500 },
		subtitle2: { fontSize: '0.75rem', fontWeight: 400 },
		button: { fontSize: ${fontSizeNumeric}, fontWeight: 500, textTransform: 'uppercase' },
		caption: { fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)' },
	},
`;
}

/**
 * Generate spacing from tokens
 */
function generateSpacing(spacing: Record<string, string>): string {
	if (Object.keys(spacing).length === 0) {
		return "";
	}

	// Default spacing factor
	const factor = 8;

	return `
	spacing: ${factor},
`;
}

/**
 * Generate component overrides (for custom styling)
 */
function generateComponents(colors: Record<string, string>): string {
	if (Object.keys(colors).length === 0) {
		return "";
	}

	return `
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 4,
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 8,
				},
			},
		},
	},
`;
}

/**
 * Generate theme provider wrapper component
 */
export function generateThemeProvider(
	tokens: DesignTokens,
	styling: StylingInfo,
): string {
	const isMUI = styling.approach.startsWith("mui");

	if (isMUI) {
		const themeDefinition = generateMUITheme(tokens);
		return `
import React from 'react';
${themeDefinition}

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
}
`;
	}

	// Default fallback for other frameworks
	return `
import React from 'react';
export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
`;
}

/**
 * Helper: Lighten a hex color
 * Simple implementation for demo purposes
 */
function lightenColor(hex: string, percent: number): string {
	const num = parseInt(hex.replace("#", ""), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.min(255, (num >> 16) + amt);
	const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
	const B = Math.min(255, (num & 0x0000ff) + amt);

	return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

/**
 * Helper: Darken a hex color
 * Simple implementation for demo purposes
 */
function darkenColor(hex: string, percent: number): string {
	const num = parseInt(hex.replace("#", ""), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.max(0, (num >> 16) - amt);
	const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
	const B = Math.max(0, (num & 0x0000ff) - amt);

	return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}
