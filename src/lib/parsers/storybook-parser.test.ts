import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseStorybookUrl } from "./storybook-parser";

describe("parseStorybookUrl", () => {
	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();
	});

	it("should fetch Storybook index.json", async () => {
		const mockIndex = {
			v: 5,
			entries: {
				"button--primary": {
					id: "button--primary",
					title: "Components/Button",
					name: "Primary",
					type: "story",
					importPath: "./packages/suite-base/src/components/Button.stories.tsx",
					componentPath: "./packages/suite-base/src/components/Button.tsx",
					tags: ["dev", "test"],
				},
			},
		};

		global.fetch = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockIndex,
			})
			.mockResolvedValueOnce({
				ok: true,
				text: async () => "export const Button = ...",
			});

		const result = await parseStorybookUrl("http://localhost:9009");

		expect(global.fetch).toHaveBeenCalledWith(
			"http://localhost:9009/index.json",
		);
		expect(result.components).toBeDefined();
		expect(result.tokens).toBeDefined();
		expect(result.styling).toBeDefined();
	});

	it("should handle network errors gracefully", async () => {
		global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

		await expect(parseStorybookUrl("http://localhost:9009")).rejects.toThrow();
	});

	it("should handle invalid Storybook response", async () => {
		global.fetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			statusText: "Not Found",
		});

		await expect(parseStorybookUrl("http://localhost:9009")).rejects.toThrow();
	});

	it("should extract component information from stories", async () => {
		        const mockIndex = {
		            v: 5,
		            entries: {
		                "alertslist--default": {
		                    id: "alertslist--default",
		                    title: "components/AlertsList",
		                    name: "Default",
		                    type: "story",
		                    importPath:
		                        "./packages/suite-base/src/components/AlertsList.stories.tsx",
		                    componentPath: "@lichtblick/suite-base/components/AlertsList",
		                    tags: ["dev", "test"],
		                },
		                "alertslist--with-errors": {
		                    id: "alertslist--with-errors",
		                    title: "components/AlertsList",
		                    name: "With Errors",
		                    type: "story",
		                    importPath:
		                        "./packages/suite-base/src/components/AlertsList.stories.tsx",
		                    componentPath: "@lichtblick/suite-base/components/AlertsList",
		                    tags: ["dev", "test"],
		                },
		            },
		        };
		
		        global.fetch = vi
		            .fn()
		            .mockResolvedValueOnce({
		                ok: true,
		                json: async () => mockIndex,
		            })
		            .mockResolvedValueOnce({
		                ok: true,
		                text: async () => "export const AlertsList = ...",
		            });
		const result = await parseStorybookUrl("http://localhost:9009");

		expect(result.components.length).toBeGreaterThan(0);
		expect(result.components[0].name).toBe("AlertsList");
	});

	it("should detect MUI styling approach", async () => {
		const mockIndex = {
			v: 5,
			entries: {
				"button--default": {
					id: "button--default",
					title: "Components/Button",
					name: "Default",
					type: "story",
					importPath: "./Button.stories.tsx",
				},
			},
		};

		const mockCode = `
			import { styled } from '@mui/material/styles';
			const Button = styled('button')({});
		`;

		global.fetch = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockIndex,
			})
			.mockResolvedValueOnce({
				ok: true,
				text: async () => mockCode,
			});

		const result = await parseStorybookUrl("http://localhost:9009");

		expect(result.styling.approach).toBe("mui-styled");
		expect(global.fetch).toHaveBeenCalledTimes(2);
	});

	it("should extract design tokens", async () => {
		        const mockIndex = {
		            v: 5,
		            entries: {},
		        };
		
		        global.fetch = vi
		            .fn()
		            .mockResolvedValueOnce({
		                ok: true,
		                json: async () => mockIndex,
		            })
		            .mockResolvedValueOnce({
		                ok: true,
		                text: async () => "token content",
		            });
		const result = await parseStorybookUrl("http://localhost:9009");

		expect(result.tokens.colors).toBeDefined();
		expect(result.tokens.spacing).toBeDefined();
		expect(result.tokens.typography).toBeDefined();
	});
});
