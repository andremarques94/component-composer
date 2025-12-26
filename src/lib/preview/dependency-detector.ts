import type { DesignSystemContext, StylingInfo } from "@/types/design-system";

/**
 * Dependency mapping for different styling approaches
 * Maps styling approach to required npm packages
 */
const DEPENDENCY_MAP: Record<
	StylingInfo["approach"],
	Record<string, string>
> = {
	"mui-sx": {
		"@mui/material": "^6.0.0", // Use v6 stable instead of v7 to avoid beta issues
		"@mui/icons-material": "^6.0.0",
		"@emotion/react": "^11.0.0",
		"@emotion/styled": "^11.0.0",
		"@popperjs/core": "latest",
	},
	"mui-styled": {
		"@mui/material": "^6.0.0",
		"@mui/icons-material": "^6.0.0",
		"@emotion/react": "^11.0.0",
		"@emotion/styled": "^11.0.0",
		"@popperjs/core": "latest",
	},
	emotion: {
		"@emotion/react": "^11.0.0",
		"@emotion/styled": "^11.0.0",
	},
	"styled-components": {
		"styled-components": "^6.0.0",
	},
	tailwind: {
		// Tailwind is handled via CDN in Sandpack
	},
	"css-modules": {
		// No additional dependencies needed
	},
	chakra: {
		"@chakra-ui/react": "^2.8.0",
		"@emotion/react": "^11.0.0",
		"@emotion/styled": "^11.0.0",
		"framer-motion": "^10.0.0",
	},
	mantine: {
		"@mantine/core": "^7.0.0",
		"@mantine/hooks": "^7.0.0",
	},
	"ant-design": {
		antd: "^5.0.0",
	},
};

/**
 * Additional common dependencies that might be needed
 */
const COMMON_DEPENDENCIES: Record<string, string> = {
	react: "^19.0.0",
	"react-dom": "^19.0.0",
};

/**
 * Detect required npm dependencies based on design system context
 * Returns a Sandpack-compatible dependency object
 */
export function detectDependencies(
	designSystem: DesignSystemContext,
): Record<string, string> {
	const { styling } = designSystem;

	// Get base dependencies for the styling approach
	const baseDependencies = DEPENDENCY_MAP[styling.approach] || {};

	// Merge with common dependencies
	const allDependencies = {
		...COMMON_DEPENDENCIES,
		...baseDependencies,
	};

	// Add additional dependencies from detected imports
	const additionalDeps = detectAdditionalDependencies(styling.imports);

	return {
		...allDependencies,
		...additionalDeps,
	};
}

/**
 * Detect additional dependencies from import statements
 * Parses imports like "@chakra-ui/react", "framer-motion", etc.
 */
function detectAdditionalDependencies(
	imports: string[],
): Record<string, string> {
	const deps: Record<string, string> = {};

	for (const imp of imports) {
		// Extract package name from import statement
		// e.g., "import { Box } from '@chakra-ui/react'" -> "@chakra-ui/react"
		const match = imp.match(/from ['"]([^'"]+)['"]/);
		if (!match) continue;

		const packageName = match[1];

		// Skip relative imports and node built-ins
		if (packageName.startsWith(".") || packageName.startsWith("node:")) {
			continue;
		}

		// Skip already included packages
		if (packageName in COMMON_DEPENDENCIES) {
			continue;
		}

		// Add package with latest version
		// Sandpack will resolve to latest compatible version
		deps[packageName] = "latest";
	}

	return deps;
}

/**
 * Detect Sandpack template based on styling approach
 * Returns 'react' or 'react-ts' (TypeScript)
 */
export function detectTemplate(
	_approach: StylingInfo["approach"],
): "react" | "react-ts" {
	// For now, always use TypeScript template for better DX
	// Can be made smarter based on code analysis
	return "react-ts";
}

/**
 * Detect if Tailwind CSS should be included via CDN
 * Sandpack supports Tailwind via play CDN
 */
export function shouldIncludeTailwindCDN(
	approach: StylingInfo["approach"],
): boolean {
	return approach === "tailwind";
}

/**
 * Generate Sandpack setup configuration
 */
export interface SandpackSetup {
	dependencies: Record<string, string>;
	devDependencies?: Record<string, string>;
	entry?: string;
}

export function generateSandpackSetup(
	designSystem: DesignSystemContext,
): SandpackSetup {
	const dependencies = detectDependencies(designSystem);

	// Add type definitions for TypeScript
	const devDependencies: Record<string, string> = {
		"@types/react": "^19.0.0",
		"@types/react-dom": "^19.0.0",
		typescript: "^5.0.0",
	};

	return {
		dependencies,
		devDependencies,
		entry: "/index.tsx",
	};
}
