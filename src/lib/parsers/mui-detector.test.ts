import { describe, expect, it } from "vitest";
import { detectMUIPatterns } from "./mui-detector";

describe("detectMUIPatterns", () => {
	it("should detect sx prop usage", () => {
		const code = `
      <Box sx={{ p: 2, display: 'flex' }}>
        Content
      </Box>
    `;

		const result = detectMUIPatterns(code);

		expect(result.patterns).toContain("Uses sx prop for styling");
		expect(result.approach).toBe("mui-sx");
	});

	it("should detect styled API usage", () => {
		const code = `
      import { styled } from '@mui/material/styles';
      
      const StyledCard = styled(Card)(({ theme }) => ({
        padding: theme.spacing(2),
      }));
    `;

		const result = detectMUIPatterns(code);

		expect(result.patterns).toContain("Uses MUI styled() API");
		expect(result.approach).toBe("mui-styled");
		expect(result.imports).toContain(
			"import { styled } from '@mui/material/styles';",
		);
	});

	it("should detect theme token usage", () => {
		const code = `
      const styles = {
        color: theme.palette.primary.main,
        padding: theme.spacing(2),
      };
    `;

		const result = detectMUIPatterns(code);

		expect(result.patterns).toContain("Uses MUI theme tokens");
	});

	it("should detect Lichtblick ThemeProvider pattern", () => {
		const code = `
      import ThemeProvider from '@lichtblick/suite-base/theme/ThemeProvider';
      
      <ThemeProvider isDark={true}>
        <Component />
      </ThemeProvider>
    `;

		const result = detectMUIPatterns(code);

		expect(result.themeProvider).toBe("ThemeProvider");
	});

	it("should prefer mui-styled over mui-sx when both are present", () => {
		const code = `
      import { styled } from '@mui/material/styles';
      
      const StyledBox = styled(Box)(({ theme }) => ({
        padding: theme.spacing(2),
      }));
      
      <Box sx={{ margin: 1 }}>
        <StyledBox>Content</StyledBox>
      </Box>
    `;

		const result = detectMUIPatterns(code);

		expect(result.approach).toBe("mui-styled");
		expect(result.patterns).toContain("Uses MUI styled() API");
		expect(result.patterns).toContain("Uses sx prop for styling");
	});

	it("should return default values for non-MUI code", () => {
		const code = `
      const Component = () => {
        return <div className="container">Hello</div>;
      };
    `;

		const result = detectMUIPatterns(code);

		expect(result.approach).toBe("mui-sx"); // Default approach
		expect(result.patterns).toEqual([]);
		expect(result.imports).toEqual([]);
	});
});
