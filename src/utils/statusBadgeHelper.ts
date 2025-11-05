import type { Theme } from '../styles/theme';

/**
 * Utility functions for status code badge styling
 */

export interface StatusColors {
  backgroundColor: string;
  textColor: string;
}

/**
 * Determines the appropriate colors for a status code badge
 * @param status - HTTP status code
 * @param theme - The application theme object
 * @returns Object containing backgroundColor and textColor
 */
export function getStatusColors(status: number, theme: Theme): StatusColors {
  // 2xx - Success
  if (status >= 200 && status < 300) {
    return {
      backgroundColor: theme.colors.status2xx + '20',
      textColor: theme.colors.status2xx,
    };
  }

  // 3xx - Redirection
  if (status >= 300 && status < 400) {
    return {
      backgroundColor: theme.colors.status3xx + '20',
      textColor: theme.colors.status3xx,
    };
  }

  // 4xx - Client errors
  if (status >= 400 && status < 500) {
    return {
      backgroundColor: theme.colors.status4xx + '20',
      textColor: theme.colors.status4xx,
    };
  }

  // 5xx - Server errors (and any other codes)
  return {
    backgroundColor: theme.colors.status5xx + '20',
    textColor: theme.colors.status5xx,
  };
}

/**
 * Gets the status code category label
 * @param status - HTTP status code
 * @returns Category label (e.g., "Success", "Redirection")
 */
export function getStatusCategory(status: number): string {
  if (status >= 200 && status < 300) return 'Success';
  if (status >= 300 && status < 400) return 'Redirection';
  if (status >= 400 && status < 500) return 'Client Error';
  if (status >= 500) return 'Server Error';
  return 'Unknown';
}
