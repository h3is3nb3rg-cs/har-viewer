import type { HAR } from '@types';

export interface ParseResult {
  success: boolean;
  har?: HAR;
  error?: string;
}

export function parseHARFile(content: string): ParseResult {
  try {
    // Parse JSON
    const data = JSON.parse(content);

    // Validate basic structure
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        error: 'Invalid HAR file: Not a valid JSON object',
      };
    }

    if (!data.log) {
      return {
        success: false,
        error: 'Invalid HAR file: Missing "log" property',
      };
    }

    if (!Array.isArray(data.log.entries)) {
      return {
        success: false,
        error: 'Invalid HAR file: Missing or invalid "entries" array',
      };
    }

    if (data.log.entries.length === 0) {
      return {
        success: false,
        error: 'HAR file is empty: No entries found',
      };
    }

    // Validate entries have required fields
    for (let i = 0; i < Math.min(data.log.entries.length, 5); i++) {
      const entry = data.log.entries[i];
      if (!entry.request || !entry.response || !entry.timings) {
        return {
          success: false,
          error: `Invalid HAR file: Entry ${i} is missing required fields`,
        };
      }
    }

    return {
      success: true,
      har: data as HAR,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse HAR file',
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'N/A';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 0) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return isoString;
  }
}

export function getStatusCodeColor(status: number): string {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'info';
  if (status >= 400 && status < 500) return 'warning';
  if (status >= 500) return 'error';
  return 'default';
}
