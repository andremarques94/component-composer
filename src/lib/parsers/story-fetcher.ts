
/**
 * Fetches the raw content of a story file from the Storybook server.
 * This assumes the Storybook is serving source files (e.g. dev server or static build with source maps/files).
 */
export async function fetchStoryContent(
  baseUrl: string,
  importPath: string
): Promise<string | null> {
  try {
    const normalizedBase = baseUrl.replace(/\/$/, "");
    const normalizedPath = importPath.startsWith("./") 
      ? importPath.substring(1) 
      : importPath.startsWith("/") 
        ? importPath 
        : `/${importPath}`;
    
    const url = `${normalizedBase}${normalizedPath}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // It's common for source files to be missing in production Storybooks
      // We log this as info rather than a warning because we have a fallback
      console.log(`Source file not accessible at ${url} (${response.status}). Will attempt HTML fallback.`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.warn(`Error fetching story content:`, error);
    return null;
  }
}

/**
 * Fetches the rendered HTML of a story (iframe).
 * Useful for detecting framework/styling when source code is not available.
 */
export async function fetchStoryHtml(
  baseUrl: string,
  storyId: string
): Promise<string | null> {
  try {
    const normalizedBase = baseUrl.replace(/\/$/, "");
    const url = `${normalizedBase}/iframe.html?id=${storyId}&viewMode=story`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Failed to fetch story HTML from ${url}: ${response.statusText}`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.warn(`Error fetching story HTML:`, error);
    return null;
  }
}
