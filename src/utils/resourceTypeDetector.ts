import type { Entry, ResourceType } from '@types';

/**
 * Determines the resource type of an entry based on MIME type and URL patterns
 * @param entry - The HAR entry to analyze
 * @returns The detected resource type
 */
export function getResourceType(entry: Entry): ResourceType {
  const mimeType = entry.response.content.mimeType.toLowerCase();
  const url = entry.request.url.toLowerCase();

  // HTML documents
  if (mimeType.includes('html')) return 'html';

  // Stylesheets
  if (mimeType.includes('css')) return 'css';

  // JavaScript
  if (mimeType.includes('javascript') || mimeType.includes('ecmascript')) {
    return 'javascript';
  }

  // API requests (JSON/XML)
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'xhr';

  // Images
  if (mimeType.startsWith('image/')) return 'image';

  // Fonts
  if (
    mimeType.startsWith('font/') ||
    mimeType.includes('woff') ||
    mimeType.includes('ttf')
  ) {
    return 'font';
  }

  // Media (video/audio)
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
    return 'media';
  }

  // Web app manifest
  if (url.includes('manifest.json') || mimeType.includes('manifest')) {
    return 'manifest';
  }

  // WebSocket connections
  if (url.includes('websocket') || entry.response.status === 101) {
    return 'websocket';
  }

  // Fetch API requests
  if (mimeType.includes('fetch')) return 'fetch';

  // Default to 'other' for unrecognized types
  return 'other';
}
