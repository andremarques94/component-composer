/**
 * Extract React code from LLM-generated markdown responses
 * Handles various markdown formats and code block styles
 */

export interface CodeExtractionResult {
	code: string;
	hasDefaultExport: boolean;
	imports: string[];
	componentName?: string;
}

/**
 * Extract code from markdown code blocks
 * Supports: ```tsx, ```jsx, ```typescript, ```javascript, ```ts, ```js
 */
export function extractCodeFromMarkdown(markdown: string): string {
	if (!markdown || typeof markdown !== "string") {
		return "";
	}

	// 1. Try to match complete code blocks first
	const codeBlockRegex =
		/```(?:tsx|jsx|typescript|javascript|ts|js)?\n([\s\S]*?)```/g;
	const matches = Array.from(markdown.matchAll(codeBlockRegex));

	if (matches.length > 0) {
		// Extract all code blocks
		const codeBlocks = matches.map((match) => match[1].trim());
		// If multiple blocks, combine them
		if (codeBlocks.length > 1) {
			return codeBlocks.join("\n\n");
		}
		return codeBlocks[0];
	}

	// 2. Handle unclosed code blocks (common during streaming)
	// Matches ```tsx at start, captures everything after until end of string
	const unclosedRegex = /^```(?:tsx|jsx|typescript|javascript|ts|js)?\n([\s\S]*)$/;
	const unclosedMatch = markdown.match(unclosedRegex);
	if (unclosedMatch) {
		return unclosedMatch[1].trim();
	}

	// 3. Fallback: Check if it looks like React code but contains markdown fences that regex missed
	let cleaned = markdown.trim();
	
	// Remove opening fence if present
	if (cleaned.startsWith("```")) {
		cleaned = cleaned.replace(/^```(?:tsx|jsx|typescript|javascript|ts|js)?\n?/, "");
	}
	
	// Remove closing fence if present (partial stream might have opening but not closing, or vice versa if split weirdly)
	if (cleaned.endsWith("```")) {
		cleaned = cleaned.substring(0, cleaned.length - 3);
	}

	// Final check: if it looks like code, return it
	if (cleaned.includes("import") || cleaned.includes("export") || cleaned.includes("<")) {
		return cleaned.trim();
	}

	return "";
}

/**
 * Detect if code has a default export
 */
export function hasDefaultExport(code: string): boolean {
	if (!code) return false;

	// Check for various default export patterns
	const patterns = [
		/export\s+default\s+function/,
		/export\s+default\s+class/,
		/export\s+default\s+const/,
		/export\s+default\s+\w+/,
		/export\s+{\s*\w+\s+as\s+default\s*}/,
	];

	return patterns.some((pattern) => pattern.test(code));
}

/**
 * Extract import statements from code
 */
export function extractImports(code: string): string[] {
	if (!code) return [];

	const importRegex = /^import\s+.*?;?$/gm;
	const matches = code.match(importRegex);

	return matches ? matches.map((imp) => imp.trim()) : [];
}

/**
 * Extract component name from code
 * Looks for function/const declarations that return JSX
 */
export function extractComponentName(code: string): string | undefined {
	if (!code) return undefined;

	// Try to find component name from various patterns
	const patterns = [
		// export default function ComponentName
		/export\s+default\s+function\s+(\w+)/,
		// export default const ComponentName
		/export\s+default\s+const\s+(\w+)/,
		// function ComponentName() { return
		/function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?return\s+</,
		// const ComponentName = () =>
		/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,
		// const ComponentName: React.FC
		/const\s+(\w+)\s*:\s*React\.FC/,
	];

	for (const pattern of patterns) {
		const match = code.match(pattern);
		if (match?.[1]) {
			// Check if it's a component (starts with uppercase)
			const name = match[1];
			if (name[0] === name[0].toUpperCase()) {
				return name;
			}
		}
	}

	return undefined;
}

/**
 * Wrap component code if it doesn't have a default export
 * Creates a wrapper component that renders the extracted component
 */
export function wrapComponentCode(
	code: string,
	componentName?: string,
): string {
	if (!code) return code;

	// If already has default export, don't wrap
	if (hasDefaultExport(code)) {
		return code;
	}

	// Check if code seems incomplete (unbalanced braces)
	// This prevents appending a default export to a partial code block (e.g. during streaming),
	// which would cause syntax errors like "Unexpected keyword 'export'".
	const openBraces = (code.match(/\{/g) || []).length;
	const closeBraces = (code.match(/\}/g) || []).length;
	if (openBraces !== closeBraces) {
		return code;
	}

	// Try to detect component name if not provided
	const detectedName = componentName || extractComponentName(code);

	if (detectedName) {
		// Add default export for the component
		return `${code}\n\nexport default ${detectedName};`;
	}

	// If we can't detect the component name, wrap everything in a default export
	// This handles bare JSX or unnamed components
	return `${code}\n\nexport default function GeneratedComponent() {\n  return (\n    <div>\n      {/* Generated component */}\n    </div>\n  );\n}`;
}

/**
 * Fix MUI Icon imports to use default exports to avoid Sandpack issues
 * Converts: import { Add, Remove } from '@mui/icons-material';
 * To: import Add from '@mui/icons-material/Add'; import Remove from '@mui/icons-material/Remove';
 */
export function fixMuiIconImports(code: string): string {
	// 1. Fix Style imports (styled, useTheme, createTheme) incorrectly imported from @mui/material
	// Matches: import { styled, Box } from '@mui/material'; -> moves styled to @mui/material/styles
	let fixedCode = code;
	
	const styleImports = ['styled', 'createTheme', 'useTheme', 'ThemeProvider', 'alpha', 'darken', 'lighten'];
	
	// Simple regex to find imports from @mui/material that contain style utilities
	// Note: This is a basic implementation. A full AST parser would be safer but heavier.
	// We'll look for the specific pattern: import { ... } from '@mui/material'
	const muiMaterialRegex = /import\s+\{([\s\S]*?)\}\s+from\s+['"]@mui\/material['"];?/g;
	
	fixedCode = fixedCode.replace(muiMaterialRegex, (match, content) => {
		const parts = content.split(',').map((p: string) => p.trim()).filter(Boolean);
		const styleParts: string[] = [];
		const otherParts: string[] = [];
		
		for (const part of parts) {
			// Handle aliasing: styled as muiStyled
			const name = part.split(' as ')[0].trim();
			if (styleImports.includes(name)) {
				styleParts.push(part);
			} else {
				otherParts.push(part);
			}
		}
		
		let result = '';
		if (otherParts.length > 0) {
			result += `import { ${otherParts.join(', ')} } from '@mui/material';\n`;
		}
		if (styleParts.length > 0) {
			result += `import { ${styleParts.join(', ')} } from '@mui/material/styles';\n`;
		}
		return result || match; // Fallback if something went wrong
	});

	// 2. Fix Icon imports
	// Match named imports from @mui/icons-material (with optional trailing slash)
	// AND match common hallucination @mui/material/icons
	const iconRegex = /import\s+\{([\s\S]*?)\}\s+from\s+['"](@mui\/icons-material\/?|@mui\/material\/icons\/?)['"];?/g;
	
	return fixedCode.replace(iconRegex, (match, imports) => {
		// Clean up newlines and extra spaces
		const iconNames = imports.split(',').map((name: string) => name.trim()).filter(Boolean);
		
		return iconNames.map((name: string) => {
			// Handle aliases: import { Add as AddIcon } from ...
			if (name.includes(' as ')) {
				const [original, alias] = name.split(' as ').map((n: string) => n.trim());
				return `import ${alias} from '@mui/icons-material/${original}';`;
			}
			return `import ${name} from '@mui/icons-material/${name}';`;
		}).join('\n');
	});
}

/**
 * Clean up common LLM hallucination in imports (like leading spaces in path)
 * Converts: import { Box } from ' @mui/material';
 * To: import { Box } from '@mui/material';
 */
export function cleanupImports(code: string): string {
	if (!code) return code;

	// Matches: from ' space/path' or from " space/path"
	const spaceInImportRegex =
		/(from\s+['"])\s+([^'"]+?)\s*(['"])/g;

	return code.replace(spaceInImportRegex, "$1$2$3");
}

/**
 * Prepare code for execution in Sandpack
 * - Extracts from markdown
 * - Ensures it has a default export
 * - Removes problematic relative imports
 * - Fixes MUI icon imports
 */
export function prepareCodeForPreview(markdown: string): CodeExtractionResult {
	// Extract code from markdown
	let code = extractCodeFromMarkdown(markdown);

	if (!code) {
		return {
			code: "",
			hasDefaultExport: false,
			imports: [],
		};
	}

	// Clean up hallucinated spaces in imports
	code = cleanupImports(code);

	// Fix imports BEFORE wrapping/analyzing
	code = fixMuiIconImports(code);

	// Extract metadata
	const imports = extractImports(code);
	const componentName = extractComponentName(code);
	const hasExport = hasDefaultExport(code);

	// Wrap if needed
	const wrappedCode = hasExport ? code : wrapComponentCode(code, componentName);

	return {
		code: wrappedCode,
		hasDefaultExport: hasDefaultExport(wrappedCode),
		imports,
		componentName,
	};
}
