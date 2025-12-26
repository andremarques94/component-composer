import {
	SandpackCodeEditor,
	type SandpackFiles,
	SandpackLayout,
	SandpackPreview,
	SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useMemo } from "react";
import { prepareCodeForPreview } from "@/lib/preview/code-extractor";
import { generateSandpackSetup } from "@/lib/preview/dependency-detector";
import { generateThemeProvider } from "@/lib/preview/theme-provider-generator";
import type { DesignSystemContext } from "@/types/design-system";

interface CodePreviewProps {
	code: string;
	designSystem: DesignSystemContext;
	isStreaming?: boolean;
}

export function CodePreview({
	code,
	designSystem,
	isStreaming = false,
}: CodePreviewProps) {
	// Prepare code for preview (extract from markdown, ensure default export)
	const prepared = useMemo(() => prepareCodeForPreview(code), [code]);

	// Generate Sandpack setup based on design system
	const sandpackSetup = useMemo(
		() => generateSandpackSetup(designSystem),
		[designSystem],
	);

	// Generate theme provider code
	const themeProviderCode = useMemo(
		() => generateThemeProvider(designSystem.tokens, designSystem.styling),
		[designSystem.tokens, designSystem.styling],
	);

	// Create files object for Sandpack
	const files: SandpackFiles = useMemo(
		() => ({
			"/App.tsx": prepared.code,
			"/ThemeProvider.tsx": themeProviderCode,
			"/index.tsx": `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ThemeProvider from "./ThemeProvider";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <div style={{ padding: '20px' }}>
        <App title="Generated Component" description="This is a preview of your generated component." />
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
`,
			"/styles.css": `
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
body {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	background-color: #f5f5f5;
}
`,
		}),
		[prepared.code, themeProviderCode],
	);

	if (!prepared.code) {
		return (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				<p className="text-sm">Generate a component to see preview</p>
			</div>
		);
	}

	return (
		<>
			{isStreaming && (
				<div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
					<div className="text-sm text-muted-foreground">
						Generating component...
					</div>
				</div>
			)}

			{prepared.code && (
				<div className="h-full flex min-h-0">
					<SandpackProvider
						template="react-ts"
						theme="auto"
						files={files}
						customSetup={sandpackSetup}
						options={{
							activeFile: "/App.tsx",
							classes: {
								"sp-layout": "h-full w-full flex",
							},
						}}
					>
						<SandpackLayout style={{ height: "100%", width: "100%" }}>
							<div className="flex-1 h-full overflow-hidden border-r min-w-0">
								<SandpackCodeEditor
									style={{ height: "100%" }}
									showLineNumbers={true}
									showInlineErrors={true}
									wrapContent={true}
									readOnly={false}
								/>
							</div>
							<div className="flex-1 h-full overflow-hidden min-w-0">
								<SandpackPreview
									showOpenInCodeSandbox={false}
									showNavigator={false}
									showRefreshButton={true}
									style={{ height: "100%" }}
								/>
							</div>
						</SandpackLayout>
					</SandpackProvider>
				</div>
			)}
		</>
	);
}
