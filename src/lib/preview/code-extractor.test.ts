import { describe, expect, it } from "vitest";
import {
	extractCodeFromMarkdown,
	extractComponentName,
	extractImports,
	hasDefaultExport,
	prepareCodeForPreview,
	wrapComponentCode,
} from "./code-extractor";

describe("extractCodeFromMarkdown", () => {
	it("should extract code from tsx markdown block", () => {
		const markdown = "```tsx\nconst Component = () => <div>Hello</div>\n```";
		const result = extractCodeFromMarkdown(markdown);
		expect(result).toBe("const Component = () => <div>Hello</div>");
	});

	it("should extract code from jsx markdown block", () => {
		const markdown = "```jsx\nconst Component = () => <div>Hello</div>\n```";
		const result = extractCodeFromMarkdown(markdown);
		expect(result).toBe("const Component = () => <div>Hello</div>");
	});

	it("should extract code from typescript markdown block", () => {
		const markdown = "```typescript\ninterface Props { name: string }\n```";
		const result = extractCodeFromMarkdown(markdown);
		expect(result).toBe("interface Props { name: string }");
	});

	it("should handle multiple code blocks by combining them", () => {
		const markdown = `\`\`\`tsx
import React from 'react';
\`\`\`

\`\`\`tsx
const Component = () => <div>Hello</div>
\`\`\``;
		const result = extractCodeFromMarkdown(markdown);
		expect(result).toContain("import React");
		expect(result).toContain("const Component");
	});

	it("should return plain code if no markdown blocks found", () => {
		const code =
			"import React from 'react';\nconst Component = () => <div>Hi</div>";
		const result = extractCodeFromMarkdown(code);
		expect(result).toBe(code);
	});

	it("should return empty string for invalid input", () => {
		expect(extractCodeFromMarkdown("")).toBe("");
		expect(extractCodeFromMarkdown("No code here")).toBe("");
	});

	it("should handle code with language identifier variations", () => {
		const markdown = "```js\nconst x = 1;\n```";
		expect(extractCodeFromMarkdown(markdown)).toBe("const x = 1;");
	});

	it("should handle unclosed code blocks (streaming)", () => {
		const markdown = "```tsx\nimport React from 'react';\nconst Component = () => <div />";
		expect(extractCodeFromMarkdown(markdown)).toBe("import React from 'react';\nconst Component = () => <div />");
	});

	it("should handle unclosed code blocks with language identifier", () => {
		const markdown = "```typescript\nexport const x = 1;";
		expect(extractCodeFromMarkdown(markdown)).toBe("export const x = 1;");
	});
});

describe("hasDefaultExport", () => {
	it("should detect export default function", () => {
		const code = "export default function Component() {}";
		expect(hasDefaultExport(code)).toBe(true);
	});

	it("should detect export default const", () => {
		const code = "export default const Component = () => {};";
		expect(hasDefaultExport(code)).toBe(true);
	});

	it("should detect export default class", () => {
		const code = "export default class Component {}";
		expect(hasDefaultExport(code)).toBe(true);
	});

	it("should detect export default identifier", () => {
		const code = "const Component = () => {};\nexport default Component;";
		expect(hasDefaultExport(code)).toBe(true);
	});

	it("should detect export { X as default }", () => {
		const code = "export { Component as default };";
		expect(hasDefaultExport(code)).toBe(true);
	});

	it("should return false for named exports only", () => {
		const code = "export const Component = () => {};";
		expect(hasDefaultExport(code)).toBe(false);
	});

	it("should return false for no exports", () => {
		const code = "const Component = () => {};";
		expect(hasDefaultExport(code)).toBe(false);
	});

	it("should return false for empty code", () => {
		expect(hasDefaultExport("")).toBe(false);
	});
});

describe("extractImports", () => {
	it("should extract single import", () => {
		const code = "import React from 'react';";
		const result = extractImports(code);
		expect(result).toEqual(["import React from 'react';"]);
	});

	it("should extract multiple imports", () => {
		const code = `import React from 'react';
import { Box } from '@mui/material';
import styled from 'styled-components';`;
		const result = extractImports(code);
		expect(result).toHaveLength(3);
		expect(result[0]).toContain("React");
		expect(result[1]).toContain("Box");
		expect(result[2]).toContain("styled");
	});

	it("should handle imports without semicolons", () => {
		const code =
			"import React from 'react'\nimport { Box } from '@mui/material'";
		const result = extractImports(code);
		expect(result).toHaveLength(2);
	});

	it("should return empty array for code without imports", () => {
		const code = "const Component = () => <div>Hi</div>";
		const result = extractImports(code);
		expect(result).toEqual([]);
	});

	it("should return empty array for empty code", () => {
		expect(extractImports("")).toEqual([]);
	});
});

describe("extractComponentName", () => {
	it("should extract name from export default function", () => {
		const code = "export default function MyComponent() { return <div />; }";
		expect(extractComponentName(code)).toBe("MyComponent");
	});

	it("should extract name from const arrow function", () => {
		const code = "const MyComponent = () => <div />;";
		expect(extractComponentName(code)).toBe("MyComponent");
	});

	it("should extract name from React.FC type", () => {
		const code = "const MyComponent: React.FC = () => <div />;";
		expect(extractComponentName(code)).toBe("MyComponent");
	});

	it("should extract name from function declaration", () => {
		const code = "function MyComponent() { return <div />; }";
		expect(extractComponentName(code)).toBe("MyComponent");
	});

	it("should return undefined for lowercase function names", () => {
		const code = "const myFunction = () => 'hello';";
		expect(extractComponentName(code)).toBeUndefined();
	});

	it("should return undefined for code without components", () => {
		const code = "const value = 42;";
		expect(extractComponentName(code)).toBeUndefined();
	});

	it("should return undefined for empty code", () => {
		expect(extractComponentName("")).toBeUndefined();
	});
});

describe("wrapComponentCode", () => {
	it("should not wrap code that already has default export", () => {
		const code = "export default function MyComponent() { return <div />; }";
		const result = wrapComponentCode(code);
		expect(result).toBe(code);
	});

	it("should add default export for named component", () => {
		const code = "const MyComponent = () => <div />;";
		const result = wrapComponentCode(code, "MyComponent");
		expect(result).toContain("export default MyComponent;");
	});

	it("should detect and export component name automatically", () => {
		const code = "const MyComponent = () => <div />;";
		const result = wrapComponentCode(code);
		expect(result).toContain("export default MyComponent;");
	});

	it("should create wrapper for code without detectable component", () => {
		const code = "const value = 42;";
		const result = wrapComponentCode(code);
		expect(result).toContain("export default function GeneratedComponent()");
	});

	it("should return empty string for empty code", () => {
		expect(wrapComponentCode("")).toBe("");
	});

	it("should not wrap if braces are unbalanced (incomplete code)", () => {
		const code = "import { Box ";
		const result = wrapComponentCode(code);
		expect(result).toBe(code);
		expect(result).not.toContain("export default");
	});

	it("should wrap if braces are balanced", () => {
		const code = "import { Box } from '@mui/material';\nconst MyComponent = () => <div />";
		const result = wrapComponentCode(code);
		expect(result).toContain("export default MyComponent;");
	});
});

describe("prepareCodeForPreview", () => {
	it("should extract and prepare complete component", () => {
		const markdown = `Here's a component:

\`\`\`tsx
import React from 'react';

export default function MyComponent() {
  return <div>Hello</div>;
}
\`\`\``;
		const result = prepareCodeForPreview(markdown);

		expect(result.code).toContain("export default function MyComponent");
		expect(result.hasDefaultExport).toBe(true);
		expect(result.imports).toHaveLength(1);
		expect(result.componentName).toBe("MyComponent");
	});

	it("should wrap component without default export", () => {
		const markdown = `\`\`\`tsx
const MyComponent = () => <div>Hello</div>;
\`\`\``;
		const result = prepareCodeForPreview(markdown);

		expect(result.code).toContain("export default MyComponent");
		expect(result.hasDefaultExport).toBe(true);
	});

	it("should handle plain code without markdown", () => {
		const code =
			"import React from 'react';\nconst MyComponent = () => <div>Hi</div>";
		const result = prepareCodeForPreview(code);

		expect(result.code).toContain("MyComponent");
		expect(result.imports).toHaveLength(1);
	});

	it("should return empty result for invalid input", () => {
		const result = prepareCodeForPreview("");

		expect(result.code).toBe("");
		expect(result.hasDefaultExport).toBe(false);
		expect(result.imports).toEqual([]);
	});

	it("should clean up hallucinated spaces in imports", () => {
		const markdown = "```tsx\nimport { Box } from ' @mui/material';\nimport { styled } from \" @mui/material/styles \";\nexport default function App() {}\n```";
		const result = prepareCodeForPreview(markdown);
		expect(result.code).toContain("from '@mui/material'");
		expect(result.code).toContain("from \"@mui/material/styles\"");
	});

	it("should fix MUI icon imports", () => {
		const markdown = "```tsx\nimport { Add, Remove } from '@mui/icons-material';\nexport default function App() {}\n```";
		const result = prepareCodeForPreview(markdown);
		expect(result.code).toContain("import Add from '@mui/icons-material/Add';");
		expect(result.code).toContain("import Remove from '@mui/icons-material/Remove';");
		expect(result.code).not.toContain("import { Add, Remove }");
	});

	it("should fix aliased MUI icon imports", () => {
		const markdown = "```tsx\nimport { Add as AddIcon } from '@mui/icons-material';\nexport default function App() {}\n```";
		const result = prepareCodeForPreview(markdown);
		expect(result.code).toContain("import AddIcon from '@mui/icons-material/Add';");
	});

	it("should fix imports from incorrect path @mui/material/icons", () => {
		const markdown = "```tsx\nimport { Save } from '@mui/material/icons';\nexport default function App() {}\n```";
		const result = prepareCodeForPreview(markdown);
		expect(result.code).toContain("import Save from '@mui/icons-material/Save';");
	});

	it("should fix style imports from @mui/material", () => {
		const markdown = "```tsx\nimport { styled, Box } from '@mui/material';\n```";
		const result = prepareCodeForPreview(markdown);
		expect(result.code).toContain("import { Box } from '@mui/material';");
		expect(result.code).toContain("import { styled } from '@mui/material/styles';");
	});

	it("should fix multiline icon imports", () => {
		const markdown = "```tsx\nimport {\n  Add,\n  Remove\n} from '@mui/icons-material';\n```";
		const result = prepareCodeForPreview(markdown);
		expect(result.code).toContain("import Add from '@mui/icons-material/Add';");
		expect(result.code).toContain("import Remove from '@mui/icons-material/Remove';");
	});
});
