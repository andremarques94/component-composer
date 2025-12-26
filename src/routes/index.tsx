import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { CodePreview } from "@/components/CodePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DesignSystemContext } from "@/types/design-system";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const urlId = useId();
	const promptId = useId();
	const [storybookUrl, setStorybookUrl] = useState("http://localhost:9009");
	const [prompt, setPrompt] = useState("");
	const [designSystem, setDesignSystem] = useState<DesignSystemContext | null>(
		null,
	);
	const [generatedCode, setGeneratedCode] = useState("");
	const [isParsing, setIsParsing] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	async function handleParse() {
		setIsParsing(true);
		try {
			const response = await fetch("/api/parse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: storybookUrl }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to parse");
			}

			const context = await response.json();
			setDesignSystem(context);
			toast.success(`✅ Parsed ${context.components.length} components!`);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to parse Storybook";
			toast.error(message);
		} finally {
			setIsParsing(false);
		}
	}

	async function handleGenerate() {
		if (!designSystem) {
			toast.error("Please parse a Storybook first");
			return;
		}

		setIsGenerating(true);
		setGeneratedCode("");

		try {
			const response = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt,
					designSystemContext: designSystem,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate");
			}

			// Handle streaming response
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("No response body");
			}

			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");

				// Keep the last line in the buffer as it might be incomplete
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.trim()) continue;
					try {
						const json = JSON.parse(line);
						if (json.response) {
							setGeneratedCode((prev) => prev + json.response);
						}
					} catch (e) {
						console.warn("Failed to parse JSON line:", line);
					}
				}
			}

			// Process any remaining buffer
			if (buffer.trim()) {
				try {
					const json = JSON.parse(buffer);
					if (json.response) {
						setGeneratedCode((prev) => prev + json.response);
					}
				} catch (e) {
					console.warn("Failed to parse final buffer:", buffer);
				}
			}

			toast.success("✅ Component generated!");
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to generate component";
			toast.error(message);
		} finally {
			setIsGenerating(false);
		}
	}

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar - 320px fixed */}
			<aside className="w-80 border-r p-6 overflow-auto">
				<div className="space-y-6">
					<div>
						<h1 className="text-2xl font-bold mb-2">Component Composer</h1>
						<p className="text-sm text-muted-foreground">
							AI-powered component generation
						</p>
					</div>

					{/* Input */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Design System</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor={urlId}>Storybook URL</Label>
								<Input
									id={urlId}
									value={storybookUrl}
									onChange={(e) => setStorybookUrl(e.target.value)}
									placeholder="http://localhost:9009"
								/>
							</div>
							<Button
								onClick={handleParse}
								disabled={isParsing || !storybookUrl}
								className="w-full"
							>
								{isParsing ? "Parsing..." : "Parse Storybook"}
							</Button>
						</CardContent>
					</Card>

					{/* Info */}
					{designSystem && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Parsed Info</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div>
									<p className="font-medium">Components</p>
									<p className="text-muted-foreground">
										{designSystem.components.length}
									</p>
								</div>
								<div>
									<p className="font-medium">Styling</p>
									<p className="text-muted-foreground">
										{designSystem.styling.approach}
									</p>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</aside>

			{/* Main area - Split into Prompt and Code+Preview sections */}
			<main className="flex-1 flex flex-col min-w-0">
				{/* Prompt input - top (fixed height or small) */}
				<div className="p-4 border-b bg-muted/30">
					<div className="flex gap-4 items-end max-w-5xl mx-auto w-full">
						<div className="flex-1">
							<Label htmlFor={promptId} className="mb-2 block">
								Describe your component
							</Label>
							<Textarea
								id={promptId}
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								placeholder="Create a status card with icon, title, and badge..."
								className="min-h-[80px] bg-background"
							/>
						</div>
						<Button
							onClick={handleGenerate}
							disabled={isGenerating || !prompt || !designSystem}
							className="h-[80px] px-8"
						>
							{isGenerating ? "Generating..." : "Generate"}
						</Button>
					</div>
				</div>

				{/* Code + Preview - bottom, takes remaining space */}
				<div className="flex-1 relative overflow-hidden bg-white">
					{!generatedCode ? (
						<div className="flex items-center justify-center h-full text-muted-foreground">
							{designSystem
								? "Describe a component to generate it"
								: "Parse a Storybook to get started"}
						</div>
					) : (
						<CodePreview
							code={generatedCode}
							designSystem={designSystem as DesignSystemContext}
							isStreaming={isGenerating}
						/>
					)}
				</div>
			</main>
		</div>
	);
}
