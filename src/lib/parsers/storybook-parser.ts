import type { ComponentInfo, DesignSystemContext } from "@/types/design-system";
import { detectMUIPatterns } from "./mui-detector";
import { extractThemeTokens } from "./theme-extractor";
import { fetchStoryContent, fetchStoryHtml } from "./story-fetcher";
import { detectFrameworkFromHTML } from "./framework-detector";

interface StorybookEntry {
	id: string;
	title: string;
	name: string;
	type: string;
	importPath?: string;
	componentPath?: string;
	tags?: string[];
}

interface StorybookIndex {
	v: number;
	entries: Record<string, StorybookEntry>;
}

/**
 * Parse Storybook by fetching index.json
 * For Lichtblick: http://localhost:9009/index.json
 */
export async function parseStorybookUrl(
	url: string,
): Promise<DesignSystemContext> {
	// Remove trailing slash
	const baseUrl = url.replace(/\/$/, "");

	// Fetch Storybook index.json (Storybook v7+)
	const indexUrl = `${baseUrl}/index.json`;
	const response = await fetch(indexUrl);

	if (!response.ok) {
		throw new Error(`Failed to fetch Storybook: ${response.statusText}`);
	}

	const index: StorybookIndex = await response.json();

	// Extract stories
	const stories = Object.values(index.entries || {});

	// Group by component (using title field)
	const componentMap = new Map<string, ComponentInfo>();

	for (const story of stories) {
		if (story.type !== "story") continue;

		// Extract component name from title (e.g., "components/AlertsList" -> "AlertsList")
		const componentName = story.title.split("/").pop() || story.title;

		if (!componentMap.has(componentName)) {
			componentMap.set(componentName, {
				name: componentName,
				path: story.componentPath || story.importPath || "",
				props: [],
				examples: [],
			});
		}

		// Add this story as an example
		const component = componentMap.get(componentName);
		if (component) {
			component.examples.push(story.name);
		}
	}

	// Extract design tokens
	const tokens = await extractThemeTokens(baseUrl);

	// Detect styling approach
	// Phase 7.5: Fetch real content from a sample component
	const components = Array.from(componentMap.values());
	
	// Find a suitable candidate (prefer one with a path that looks like source code)
	const candidate = components.find(c => 
		c.path && 
		!c.path.includes("node_modules") && 
		(c.path.endsWith(".tsx") || c.path.endsWith(".jsx"))
	) || components[0];

	let sourceCode = "";
	let detectedFramework: string | null = null;

	if (candidate?.path) {
		// 1. Try to fetch source code
		const fetched = await fetchStoryContent(baseUrl, candidate.path);
		if (fetched) {
			sourceCode = fetched;
		} else {
			// 2. Fallback: Try to fetch rendered HTML (iframe)
			// Find the story ID for this component
			const storyEntry = stories.find(s => 
				(s.componentPath === candidate.path) || 
				(s.importPath === candidate.path)
			);
			
			if (storyEntry) {
				const html = await fetchStoryHtml(baseUrl, storyEntry.id);
				if (html) {
					detectedFramework = detectFrameworkFromHTML(html);
					if (detectedFramework) {
						console.log(`✅ Successfully detected framework from HTML: ${detectedFramework}`);
					}
				}
			}
		}
	}

	let styling = detectMUIPatterns(sourceCode);

	// If we detected a framework from HTML and didn't find specific MUI patterns in source (or source failed),
	// trust the HTML detection
	if (detectedFramework && (!sourceCode || styling.approach === "mui-sx")) {
		// If we found specific framework markers, override the default "mui-sx" fallback
		if (detectedFramework !== "mui-sx") {
			// We need to cast here because detectMUIPatterns returns a strict type
			// and we are potentially introducing new types like 'chakra'
			styling = {
				...styling,
				approach: detectedFramework as any
			};
		}
	}

	// Extract conventions from component names
	const conventions = extractConventions(components);

	// Build example usage (simplified for now)
	const examples = components.slice(0, 3).map((comp) => ({
		component: comp.name,
		usage: `// Example usage of ${comp.name}\n// Found ${comp.examples.length} variants in Storybook`,
	}));

	return {
		components,
		tokens,
		styling,
		conventions,
		examples,
	};
}

/**
 * Extract naming conventions from parsed components
 */
function extractConventions(components: ComponentInfo[]) {
	const propPatterns: string[] = [];

	// Analyze common patterns (this is simplified - in Phase 7 we can enhance)
	if (components.length > 0) {
		propPatterns.push("variant", "size", "color");
	}

	return {
		propPatterns,
		fileStructure: "PascalCase",
		componentPrefix: undefined,
	};
}
