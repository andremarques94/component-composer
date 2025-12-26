# Component Composer

An AI-powered tool that **learns your design system** and generates new components that perfectly match your existing patterns, styles, and conventions.

Point it at your Storybook or component repository, and it will analyze your design system to generate components that look like they were built by your team.

## 🎯 The Problem It Solves

Building new components in an existing design system is tedious:
- ❌ Need to remember exact prop patterns
- ❌ Must follow styling conventions
- ❌ Have to look up design tokens
- ❌ Copy-paste and modify existing components

**Component Composer automates this** by learning your design system and generating components that match your patterns exactly.

## ✨ How It Works
```
1. Parse Your Design System
   ↓
   Analyze Storybook or component code
   Extract patterns, styles, conventions
   
2. Describe What You Need
   ↓
   "A product card with image, title, price, and buy button"
   
3. Generate Component
   ↓
   AI creates component matching YOUR design system
   Uses YOUR styling approach
   Follows YOUR naming conventions
   Composes YOUR existing components
   
4. Preview & Use
   ↓
   See it live, test interactions
   Copy code directly into your project
```

## 🚀 Features

- 🎨 **Design System Aware** - Learns from your Storybook or component code
- 🤖 **LLM Agnostic** - Works with Claude, GPT, or local Ollama
- 👀 **Live Preview** - See components render as code is generated
- ⚡ **Streaming** - Real-time code generation
- 🎭 **Style Matching** - Detects and uses your styling approach (Emotion, Styled Components, CSS Modules, Tailwind)
- 🎨 **Token Aware** - Uses your design tokens (colors, spacing, typography)
- 🔒 **Sandboxed** - Safe execution in isolated environment
- 💅 **Modern UI** - Built with Tailwind CSS and shadcn/ui

## 🏗️ Tech Stack

- **[TanStack Start](https://tanstack.com/start)** - Full-stack React framework
- **[SST v3](https://sst.dev)** - Infrastructure as Code
- **[Tailwind CSS](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)** - App UI
- **[React Sandpack](https://sandpack.codesandbox.io/)** - Live preview
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching
- **Zod** - Validation

## 📋 Prerequisites

- Node.js 18+ or Bun
- npm/pnpm/yarn
- (Optional) Ollama for local LLM

## 🚀 Getting Started

### 1. Install
```bash
git clone <repo-url> component-composer
cd component-composer
npm install
```

### 2. Setup shadcn
```bash
npx shadcn@latest init
npx shadcn@latest add button card textarea select scroll-area separator
```

### 3. Configure Environment

Create `.env.local`:
```bash
# LLM Provider
LLM_PROVIDER=ollama  # or 'anthropic' or 'openai'

# API Keys (for cloud providers)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Ollama (for local)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 💡 Usage

### Step 1: Connect Your Design System

**Option A: Storybook URL**
```
https://your-company.com/storybook
```

**Option B: Local Repository Path**
```
/path/to/your-project/src/components
```

Click "Parse Design System" - this will analyze:
- Component structures and props
- Styling approach (Emotion, Styled Components, etc.)
- Design tokens (colors, spacing, typography)
- Naming conventions
- Usage patterns

### Step 2: Review Parsed Information

The app shows what it learned:
```
✓ Found 47 components
✓ Styling: Emotion + TypeScript
✓ Design Tokens: 24 colors, 8 spacing values
✓ Conventions: Props use 'variant', 'size' pattern
```

### Step 3: Generate Components

Describe what you need:
```
"A product card component with:
- Product image at the top
- Title and description
- Price with old/new price display
- Add to cart button
- Favorite icon button
"
```

### Step 4: Watch It Generate

- **Left side**: Code streams in real-time
- **Right side**: Component renders live
- Uses YOUR design tokens
- Matches YOUR styling approach
- Follows YOUR conventions

### Step 5: Use It

- Click "Copy Code"
- Paste into your project
- It already matches your design system!

## 🎨 Design System Support

Component Composer supports any React design system:

### Material-UI (MUI)
```typescript
// Detects you use MUI + Emotion
import { styled } from '@mui/material/styles'
import { Card, Button } from '@mui/material'

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  // Uses your theme tokens
}))
```

### Styled Components
```typescript
// Detects you use styled-components
import styled from 'styled-components'

const Card = styled.div`
  padding: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.primary};
  // Uses your theme
`
```

### Emotion
```typescript
// Detects you use Emotion
import { css } from '@emotion/react'

const cardStyles = (theme) => css`
  padding: ${theme.spacing.md};
  color: ${theme.colors.primary};
`
```

### Tailwind
```typescript
// Detects you use Tailwind
export function Card({ children }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {children}
    </div>
  )
}
```

### CSS Modules
```typescript
// Detects you use CSS Modules
import styles from './Card.module.css'

export function Card({ children }) {
  return <div className={styles.card}>{children}</div>
}
```

## 📁 Project Structure
```
component-composer/
├── app/
│   ├── routes/
│   │   ├── api/
│   │   │   ├── parse-storybook.ts    # Parse design system
│   │   │   └── generate.ts           # Generate component
│   │   ├── _layout.tsx
│   │   └── index.tsx                 # Main interface
│   ├── components/
│   │   ├── ui/                       # shadcn components
│   │   ├── ChatInterface.tsx         # Chat UI
│   │   ├── SplitView.tsx             # Code + Preview
│   │   └── DesignSystemInfo.tsx      # Show parsed info
│   ├── lib/
│   │   ├── parsers/
│   │   │   ├── storybook-parser.ts   # Parse Storybook
│   │   │   └── code-parser.ts        # Parse repository
│   │   ├── llm-client.ts             # LLM abstraction
│   │   └── utils.ts
│   └── types/
│       └── shared.ts                 # Types + schemas
├── sst.config.ts
├── tailwind.config.ts
└── package.json
```

## 🔍 What Gets Parsed

### From Storybook

1. **Component Stories** (`.stories.tsx`)
   - Component props and types
   - Usage examples
   - Variants and states

2. **Documentation** (MDX)
   - Design principles
   - Usage guidelines
   - Best practices

3. **Design Tokens**
   - Colors
   - Spacing
   - Typography
   - Breakpoints

### From Repository

1. **Component Files**
   - Component structure
   - Prop patterns
   - Styling approach

2. **Theme Files**
   - Design tokens
   - Theme configuration

3. **Common Patterns**
   - Import patterns
   - Composition patterns
   - Naming conventions

## 🤖 LLM Provider Setup

### Option 1: Ollama (Free, Local)
```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3.1

# Configure
echo "LLM_PROVIDER=ollama" >> .env.local
```

**Best for:** Development, privacy, no costs

### Option 2: Claude API (Best Quality)
```bash
# Get key from https://console.anthropic.com
echo "LLM_PROVIDER=anthropic" >> .env.local
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local
```

**Best for:** Production, highest quality

### Option 3: OpenAI GPT
```bash
# Get key from https://platform.openai.com
echo "LLM_PROVIDER=openai" >> .env.local
echo "OPENAI_API_KEY=sk-..." >> .env.local
```

**Best for:** Fast, reliable fallback

## 🚢 Deployment

### Cloudflare Workers (Recommended)
```bash
npx sst init
npm run deploy:production
```

**Cost:** ~$0-5/month

### AWS Lambda
```bash
# Update sst.config.ts to use AWS
npm run deploy
```

### Self-Host
```bash
npm run build
docker build -t component-composer .
docker run -p 3000:3000 component-composer
```

## 🎨 Example Generations

### Input
```
Storybook: https://your-company.com/storybook
Prompt: "Generate a user profile card"
```

### Output (Matches YOUR Design System)
```typescript
// If you use MUI + Emotion
import { Card, Avatar, Typography, Button } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(2),
}))

export function UserProfileCard({ user }) {
  return (
    <StyledCard>
      <Avatar src={user.avatar} />
      <div>
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user.role}
        </Typography>
        <Button variant="outlined" size="small">
          View Profile
        </Button>
      </div>
    </StyledCard>
  )
}
```

It automatically:
- ✅ Used your MUI components
- ✅ Used Emotion's `styled` (your styling approach)
- ✅ Used your theme tokens (`theme.spacing`, etc.)
- ✅ Followed your prop patterns (`variant`, `size`)
- ✅ Matched your component structure

## 🐛 Troubleshooting

### "Could not parse Storybook"

- ✅ Check Storybook URL is accessible
- ✅ Verify Storybook version (v7+ required)
- ✅ Check CORS settings if hosted

### "Generated component doesn't work"

- ✅ Ensure design system was parsed correctly
- ✅ Check Sandpack loaded right dependencies
- ✅ Verify generated imports match your system

### "Preview not rendering"

- ✅ Check browser console for errors
- ✅ Verify design system package is in Sandpack dependencies
- ✅ Try regenerating component

### Slow parsing

- ⏱️ First parse can take 10-30 seconds
- ⏱️ Results are cached
- ⏱️ Large Storybooks take longer

## 🎯 Best Practices

### For Best Results

1. **Use comprehensive Storybook**
   - Document all components
   - Include usage examples
   - Document props clearly

2. **Consistent conventions**
   - Use consistent naming
   - Follow prop patterns
   - Document patterns

3. **Clear prompts**
   - Be specific about what you need
   - Reference existing components
   - Mention specific patterns

### Example Good Prompts
```
❌ Bad: "Make a card"

✅ Good: "Create a product card similar to our NewsCard component, but for products. Include product image, name, price, and add to cart button. Use our primary button variant."

✅ Good: "Generate a modal dialog using our Dialog component as base. Should have header with close button, scrollable content area, and footer with cancel/confirm actions."
```

## 🗺️ Roadmap

### v1 (Current)
- [ ] Storybook parsing
- [ ] Repository code parsing
- [ ] LLM provider abstraction
- [ ] Live preview
- [ ] Style matching

---

Stop copy-pasting components. Let AI learn your design system and generate them for you.