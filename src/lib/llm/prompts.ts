import type { DesignSystemContext } from "@/types/design-system";

/**
 * Build system prompt for component generation
 * This is the CRITICAL part - teaches LLM about design system
 */
export function buildSystemPrompt(context: DesignSystemContext): string {
	const isMUI = context.styling.approach.startsWith("mui");

	return `You are an expert React component generator for a specific design system.

DESIGN SYSTEM CONTEXT:
Components: ${context.components.length} available
Styling: ${context.styling.approach}
${isMUI ? "Framework: Material-UI (MUI) v7" : ""}

IMPORTANT - CODE EXECUTION ENVIRONMENT:
The generated code will run in an isolated preview environment (Sandpack) with the following constraints:
- Only absolute package imports are supported (e.g., 'import { Box } from "@mui/material"')
- NO file system access - relative imports like '../styles/color-palette' will NOT work
- All components must have a default export
- Use TypeScript for better type safety

COMMON IMPORT MISTAKES TO AVOID:
❌ Wrong: import { Badge } from '@mui/material/Badge'
✅ Correct: import { Badge } from '@mui/material'

❌ Wrong: import { IconName } from '@mui/icons-material'
❌ Wrong: import { IconName } from '@mui/material/icons'
✅ Correct: import IconName from '@mui/icons-material/IconName'

❌ Wrong: import { styled } from '../styles/components'
✅ Correct: import { styled } from '@mui/material/styles'

❌ Wrong: theme.palette.grey.300 (Syntax Error)
✅ Correct: theme.palette.grey[300] (Use bracket notation for numeric keys)

${
	isMUI
		? `
MATERIAL-UI CORRECT IMPORTS:
- Components: import { Box, Button, Card, etc. } from '@mui/material'
- Icons: MUST use default import: import CheckIcon from '@mui/icons-material/Check'
- Styles: import { styled, createTheme, useTheme } from '@mui/material/styles'

COMMON MUI IMPORT PATTERNS:
import { Box, Typography, Stack } from '@mui/material';
import { styled, createTheme, useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

STYLING APPROACHES:
${
	context.styling.approach === "mui-sx"
		? "Use sx prop for styling:\\nimport { Box } from '@mui/material';\\n\\n<Box sx={{ color: theme.palette.primary.main, padding: theme.spacing(2) }}>\\n  {children}\\n</Box>"
		: context.styling.approach === "mui-styled"
			? "Use MUI styled() API:\\nimport { styled } from '@mui/material/styles';\\n\\nconst StyledBox = styled(Box)(({ theme }) => ({ color: theme.palette.primary.main, padding: theme.spacing(2) }));"
			: ""
}

Theme usage:
- Access theme via: const theme = useTheme() or styled(({ theme }) => ...)
- Numeric keys (like grey[300]) MUST use bracket notation: theme.palette.grey[300]
- Colors: ${Object.keys(context.tokens.colors).slice(0, 5).join(", ")}${Object.keys(context.tokens.colors).length > 5 ? ", ..." : ""}
- Spacing: ${Object.keys(context.tokens.spacing).join(", ")}
- Typography: ${Object.keys(context.tokens.typography).slice(0, 5).join(", ")}${Object.keys(context.tokens.typography).length > 5 ? ", ..." : ""}
EXAMPLE OF CORRECT GENERATED COMPONENT:
\`\`\`tsx
import React from 'react';
import { Box, Typography, Badge, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';

interface StatusCardProps {
  title: string;
  isProblem?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, isProblem }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {isProblem && (
          <Badge color="error" sx={{ ml: 1 }}>Issue Detected</Badge>
        )}
      </Box>
      <IconButton><CheckIcon /></IconButton>
    </Box>
  );
};

export default StatusCard;
\`\`\``
		: ""
}

${
	context.examples.length > 0
		? `EXISTING COMPONENT EXAMPLES:
${context.examples
	.map(
		(ex) => `
Component: ${ex.component}
${ex.usage}
`,
	)
	.join("\n")}`
		: ""
}

${
	context.components.length > 0
		? `KNOWN COMPONENTS AND PATTERNS:
${context.components
	.slice(0, 20) // Limit to 20 to save tokens
	.map(
		(c) =>
			`- ${c.name}: ${c.props
				.slice(0, 5)
				.map((p) => p.name)
				.join(", ")}`,
	)
	.join("\n")}`
		: ""
}

TASK:
Generate a ${context.styling.approach === "tailwind" ? "Tailwind CSS" : context.styling.approach} component matching the design system patterns above.

Make sure to:
1. Use absolute imports only
2. Include a default export
3. Follow the styling approach (${context.styling.approach})
4. Extract and use design tokens (colors, spacing, typography)
`;
}
