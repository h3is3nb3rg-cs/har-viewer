import styled from 'styled-components';
import { getStatusColors } from '@utils/statusBadgeHelper';

/**
 * Shared status badge component for displaying HTTP status codes
 * with appropriate color coding based on status ranges:
 * - 2xx: Success (green)
 * - 3xx: Redirection (blue)
 * - 4xx: Client Error (orange)
 * - 5xx: Server Error (red)
 */
export const StatusBadge = styled.span.attrs<{ $status: number }>(({ theme, $status }) => {
  const colors = getStatusColors($status, theme);
  return {
    style: {
      backgroundColor: colors.backgroundColor,
      color: colors.textColor,
    },
  };
})<{ $status: number }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;
