import type { EntryWithMetadata } from '@types';
import type { FilterType, BuiltInFilterType, CustomFilter } from '../types/filters';

/**
 * Check if a URL matches a custom filter pattern
 */
export function matchesCustomFilter(url: string, filter: CustomFilter): boolean {
  try {
    if (filter.patternType === 'path') {
      // Path-based matching: extract path from URL and check if it contains the pattern
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      return path.toLowerCase().includes(filter.pattern.toLowerCase());
    } else {
      // Regex-based matching
      const regex = new RegExp(filter.pattern, 'i'); // case-insensitive by default
      return regex.test(url);
    }
  } catch (error) {
    // Invalid regex or URL parsing error
    console.warn(`Filter pattern error for "${filter.name}":`, error);
    return false;
  }
}

/**
 * Apply built-in filter logic
 */
function matchesBuiltInFilter(
  entry: EntryWithMetadata,
  filterType: BuiltInFilterType
): boolean {
  switch (filterType) {
    case 'all':
      return true;
    case '4xx':
      return entry.response.status >= 400 && entry.response.status < 500;
    case '5xx':
      return entry.response.status >= 500 && entry.response.status < 600;
    case 'other-errors':
      return (
        entry.response.status < 200 ||
        (entry.response.status >= 300 && entry.response.status < 400) ||
        entry.response.status >= 600
      );
    default:
      return true;
  }
}

/**
 * Apply filters to entries
 */
export function applyFilters(
  entries: EntryWithMetadata[],
  filterType: FilterType,
  customFilters: CustomFilter[],
  searchTerm?: string
): EntryWithMetadata[] {
  let filtered = entries;

  // Apply built-in or custom filter
  if (filterType === 'all') {
    // No filtering needed
  } else if (['4xx', '5xx', 'other-errors'].includes(filterType)) {
    // Built-in filter
    filtered = filtered.filter((entry) =>
      matchesBuiltInFilter(entry, filterType as BuiltInFilterType)
    );
  } else {
    // Custom filter
    const customFilter = customFilters.find((f) => f.id === filterType);
    if (customFilter) {
      filtered = filtered.filter((entry) =>
        matchesCustomFilter(entry.request.url, customFilter)
      );
    }
  }

  // Apply search term filter
  if (searchTerm && searchTerm.trim()) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (entry) =>
        entry.fileName.toLowerCase().includes(lowerSearchTerm) ||
        entry.request.url.toLowerCase().includes(lowerSearchTerm)
    );
  }

  return filtered;
}

/**
 * Calculate filter counts for all filters using a single-pass algorithm
 * Optimized from O(n*m) to O(n) complexity
 */
export function calculateFilterCounts(
  entries: EntryWithMetadata[],
  customFilters: CustomFilter[]
): Record<string, number> {
  // Initialize counts for all filters
  const counts: Record<string, number> = {
    all: entries.length,
    '4xx': 0,
    '5xx': 0,
    'other-errors': 0,
  };

  // Initialize counts for custom filters
  customFilters.forEach((filter) => {
    counts[filter.id] = 0;
  });

  // Pre-compile regex patterns for better performance
  const compiledFilters = customFilters.map((filter) => {
    if (filter.patternType === 'regex') {
      try {
        return {
          ...filter,
          compiledRegex: new RegExp(filter.pattern, 'i'),
        };
      } catch (error) {
        console.warn(`Invalid regex pattern for filter "${filter.name}":`, error);
        return { ...filter, compiledRegex: null };
      }
    }
    return { ...filter, compiledRegex: null };
  });

  // Single-pass loop through all entries
  entries.forEach((entry) => {
    const status = entry.response.status;
    const url = entry.request.url;

    // Count built-in filters
    if (status >= 400 && status < 500) {
      counts['4xx']++;
    }
    if (status >= 500 && status < 600) {
      counts['5xx']++;
    }
    if (status < 200 || (status >= 300 && status < 400) || status >= 600) {
      counts['other-errors']++;
    }

    // Count custom filters
    compiledFilters.forEach((filter) => {
      try {
        let matches = false;

        if (filter.patternType === 'path') {
          // Path-based matching
          const urlObj = new URL(url);
          const path = urlObj.pathname;
          matches = path.toLowerCase().includes(filter.pattern.toLowerCase());
        } else if (filter.compiledRegex) {
          // Regex-based matching with pre-compiled regex
          matches = filter.compiledRegex.test(url);
        }

        if (matches) {
          counts[filter.id]++;
        }
      } catch {
        // Silently skip entries that cause errors
      }
    });
  });

  return counts;
}

/**
 * Validate a filter pattern
 */
export function validatePattern(pattern: string, patternType: 'regex' | 'path'): {
  isValid: boolean;
  error?: string;
} {
  if (!pattern || pattern.trim() === '') {
    return { isValid: false, error: 'Pattern cannot be empty' };
  }

  if (patternType === 'regex') {
    try {
      new RegExp(pattern);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid regular expression',
      };
    }
  } else {
    // Path-based patterns are always valid (simple string matching)
    return { isValid: true };
  }
}
