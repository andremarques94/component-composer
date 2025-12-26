import { describe, expect, it } from "vitest";
import type { DesignSystemContext } from "@/types/design-system";
import {
	detectDependencies,
	detectTemplate,
	generateSandpackSetup,
	shouldIncludeTailwindCDN,
} from "./dependency-detector";

// Helper to create mock design system context
function createMockDesignSystem(
	approach: DesignSystemContext["styling"]["approach"],
	imports: string[] = [],
): DesignSystemContext {
	return {
		components: [],
		tokens: {
			colors: {},
			spacing: {},
			typography: {},
		},
		styling: {
			approach,
			patterns: [],
			imports,
		},
		conventions: {
			propPatterns: [],
			fileStructure: "",
		},
		examples: [],
	};
}

describe("detectDependencies", () => {
	it("should detect MUI dependencies for mui-sx approach", () => {
		const designSystem = createMockDesignSystem("mui-sx");
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("@mui/material");
		expect(deps).toHaveProperty("@mui/icons-material"); // Added check
		expect(deps).toHaveProperty("@emotion/react");
		expect(deps).toHaveProperty("@emotion/styled");
		expect(deps).toHaveProperty("react");
		expect(deps).toHaveProperty("react-dom");
	});

	it("should detect Chakra UI dependencies", () => {
		const designSystem = createMockDesignSystem("chakra");
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("@chakra-ui/react");
		expect(deps).toHaveProperty("framer-motion");
	});

	it("should detect Mantine dependencies", () => {
		const designSystem = createMockDesignSystem("mantine");
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("@mantine/core");
		expect(deps).toHaveProperty("@mantine/hooks");
	});

	it("should detect Ant Design dependencies", () => {
		const designSystem = createMockDesignSystem("ant-design");
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("antd");
	});

	it("should detect MUI dependencies for mui-styled approach", () => {
		const designSystem = createMockDesignSystem("mui-styled");
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("@mui/material");
		expect(deps).toHaveProperty("@mui/icons-material"); // Added check
		expect(deps).toHaveProperty("@emotion/react");
		expect(deps).toHaveProperty("@emotion/styled");
	});

	it("should detect Emotion dependencies for emotion approach", () => {
		const designSystem = createMockDesignSystem("emotion");
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("@emotion/react");
		expect(deps).toHaveProperty("@emotion/styled");
		expect(deps).not.toHaveProperty("@mui/material");
	});

	it("should detect styled-components dependencies", () => {
		const designSystem = createMockDesignSystem("styled-components");
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("styled-components");
		expect(deps["styled-components"]).toBe("^6.0.0");
	});

	it("should not add extra dependencies for tailwind", () => {
		const designSystem = createMockDesignSystem("tailwind");
		const deps = detectDependencies(designSystem);

		// Should only have common dependencies (react, react-dom)
		expect(deps).toHaveProperty("react");
		expect(deps).toHaveProperty("react-dom");
		expect(deps).not.toHaveProperty("tailwindcss");
	});

	it("should not add extra dependencies for css-modules", () => {
		const designSystem = createMockDesignSystem("css-modules");
		const deps = detectDependencies(designSystem);

		// Should only have common dependencies
		expect(deps).toHaveProperty("react");
		expect(deps).toHaveProperty("react-dom");
		expect(Object.keys(deps).length).toBe(2);
	});

	it("should detect additional dependencies from imports", () => {
		const designSystem = createMockDesignSystem("mui-sx", [
			"import { Box } from '@mui/material'",
			"import { motion } from 'framer-motion'",
			"import { useQuery } from '@tanstack/react-query'",
		]);
		const deps = detectDependencies(designSystem);

		expect(deps).toHaveProperty("framer-motion");
		expect(deps).toHaveProperty("@tanstack/react-query");
	});

	it("should skip relative imports", () => {
		const designSystem = createMockDesignSystem("mui-sx", [
			"import { Component } from './Component'",
			"import utils from '../utils'",
		]);
		const deps = detectDependencies(designSystem);

		// Should not include relative imports
		expect(deps).not.toHaveProperty("./Component");
		expect(deps).not.toHaveProperty("../utils");
	});

	it("should skip node built-ins", () => {
		const designSystem = createMockDesignSystem("mui-sx", [
			"import fs from 'node:fs'",
			"import path from 'node:path'",
		]);
		const deps = detectDependencies(designSystem);

		expect(deps).not.toHaveProperty("node:fs");
		expect(deps).not.toHaveProperty("node:path");
	});

	it("should handle malformed import statements gracefully", () => {
		const designSystem = createMockDesignSystem("mui-sx", [
			"import something",
			"random text",
			"",
		]);
		const deps = detectDependencies(designSystem);

		// Should still have base dependencies
		expect(deps).toHaveProperty("react");
		expect(deps).toHaveProperty("@mui/material");
	});
});

describe("detectTemplate", () => {
	it("should return react-ts for all approaches", () => {
		expect(detectTemplate("mui-sx")).toBe("react-ts");
		expect(detectTemplate("mui-styled")).toBe("react-ts");
		expect(detectTemplate("emotion")).toBe("react-ts");
		expect(detectTemplate("styled-components")).toBe("react-ts");
		expect(detectTemplate("tailwind")).toBe("react-ts");
		expect(detectTemplate("css-modules")).toBe("react-ts");
	});
});

describe("shouldIncludeTailwindCDN", () => {
	it("should return true for tailwind approach", () => {
		expect(shouldIncludeTailwindCDN("tailwind")).toBe(true);
	});

	it("should return false for non-tailwind approaches", () => {
		expect(shouldIncludeTailwindCDN("mui-sx")).toBe(false);
		expect(shouldIncludeTailwindCDN("mui-styled")).toBe(false);
		expect(shouldIncludeTailwindCDN("emotion")).toBe(false);
		expect(shouldIncludeTailwindCDN("styled-components")).toBe(false);
		expect(shouldIncludeTailwindCDN("css-modules")).toBe(false);
	});
});

describe("generateSandpackSetup", () => {
	it("should generate complete setup for MUI", () => {
		const designSystem = createMockDesignSystem("mui-sx");
		const setup = generateSandpackSetup(designSystem);

		expect(setup.dependencies).toHaveProperty("@mui/material");
		expect(setup.dependencies).toHaveProperty("react");
		expect(setup.devDependencies).toHaveProperty("@types/react");
		expect(setup.devDependencies).toHaveProperty("typescript");
		expect(setup.entry).toBe("/index.tsx");
	});

	it("should include dev dependencies for TypeScript", () => {
		const designSystem = createMockDesignSystem("emotion");
		const setup = generateSandpackSetup(designSystem);

		expect(setup.devDependencies).toHaveProperty("@types/react");
		expect(setup.devDependencies).toHaveProperty("@types/react-dom");
		expect(setup.devDependencies).toHaveProperty("typescript");
	});

	it("should handle additional imports", () => {
		const designSystem = createMockDesignSystem("mui-sx", [
			"import { useSpring } from 'react-spring'",
		]);
		const setup = generateSandpackSetup(designSystem);

		expect(setup.dependencies).toHaveProperty("react-spring");
	});
});
