
import type { StylingInfo } from "@/types/design-system";

/**
 * Detect framework from rendered HTML
 * @param html The rendered HTML content
 * @returns The styling approach identifier or null
 */
export function detectFrameworkFromHTML(html: string): StylingInfo["approach"] | null {
  if (!html) return null;

  // MUI Detection
  if (html.includes('MuiButton') || html.includes('MuiBox') || html.includes('MuiPaper')) {
    return 'mui-sx'; // Default to mui-sx for MUI as it's the safest bet
  }

  // Chakra UI Detection
  if (html.includes('chakra-')) {
    return 'chakra'; // We'll need to add this to StylingInfo type
  }

  // Mantine Detection
  if (html.includes('mantine-')) {
    return 'mantine'; // We'll need to add this to StylingInfo type
  }

  // Ant Design Detection
  if (html.includes('ant-btn') || html.includes('ant-card')) {
    return 'ant-design'; // We'll need to add this to StylingInfo type
  }

  // Tailwind CSS Detection (Heuristic)
  // Look for common utility combinations
  const tailwindPatterns = [
    'flex flex-col',
    'items-center justify-center',
    'p-4',
    'rounded-lg',
    'shadow-md',
    'text-gray-'
  ];
  
  const matchCount = tailwindPatterns.reduce((count, pattern) => 
    html.includes(pattern) ? count + 1 : count, 0
  );

  if (matchCount >= 2) {
    return 'tailwind';
  }

  return null;
}
