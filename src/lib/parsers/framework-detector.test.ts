
import { describe, it, expect } from 'vitest';
import { detectFrameworkFromHTML } from './framework-detector';

describe('detectFrameworkFromHTML', () => {
  it('detects MUI from class names', () => {
    const html = '<button class="MuiButton-root MuiButton-contained">Click me</button>';
    expect(detectFrameworkFromHTML(html)).toBe('mui-sx'); // Default to mui-sx for MUI
  });

  it('detects Chakra UI from class names', () => {
    const html = '<div class="css-12345 chakra-button">Click me</div>';
    expect(detectFrameworkFromHTML(html)).toBe('chakra');
  });

  it('detects Mantine from class names', () => {
    const html = '<div class="mantine-Button-root">Click me</div>';
    expect(detectFrameworkFromHTML(html)).toBe('mantine');
  });

  it('detects Ant Design from class names', () => {
    const html = '<button class="ant-btn ant-btn-primary">Click me</button>';
    expect(detectFrameworkFromHTML(html)).toBe('ant-design');
  });

  it('detects Tailwind from common utility classes', () => {
    // This is heuristic and tricky, but let's try
    const html = '<div class="flex flex-col p-4 bg-white rounded-lg shadow-md"></div>';
    expect(detectFrameworkFromHTML(html)).toBe('tailwind');
  });

  it('returns null if no framework detected', () => {
    const html = '<div class="my-custom-class">Content</div>';
    expect(detectFrameworkFromHTML(html)).toBeNull();
  });

  it('prioritizes specific frameworks over generic CSS', () => {
    // Chakra uses css- hash classes too, matching Emotion
    const html = '<div class="css-abcde chakra-button"></div>';
    expect(detectFrameworkFromHTML(html)).toBe('chakra');
  });
});
