
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStoryContent, fetchStoryHtml } from './story-fetcher';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchStoryContent', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches content from the correct URL', async () => {
    const baseUrl = 'http://localhost:9009';
    const importPath = './src/components/Button.stories.tsx';
    const mockContent = 'export const Default = () => <Button>Click me</Button>;';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockContent),
    });

    const content = await fetchStoryContent(baseUrl, importPath);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:9009/src/components/Button.stories.tsx');
    expect(content).toBe(mockContent);
  });

  it('handles relative paths without leading dot', async () => {
    const baseUrl = 'http://localhost:9009';
    const importPath = 'src/components/Button.stories.tsx';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('content'),
    });

    await fetchStoryContent(baseUrl, importPath);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:9009/src/components/Button.stories.tsx');
  });

  it('returns null when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const content = await fetchStoryContent('http://url', 'path');
    expect(content).toBeNull();
  });

  it('returns null when network error occurs', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const content = await fetchStoryContent('http://url', 'path');
    expect(content).toBeNull();
  });
});

describe('fetchStoryHtml', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches HTML from the correct iframe URL', async () => {
    const baseUrl = 'http://localhost:9009';
    const storyId = 'button--primary';
    const mockHtml = '<html><body>...</body></html>';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const html = await fetchStoryHtml(baseUrl, storyId);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:9009/iframe.html?id=button--primary&viewMode=story');
    expect(html).toBe(mockHtml);
  });

  it('returns null when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const html = await fetchStoryHtml('http://url', 'id');
    expect(html).toBeNull();
  });
});
