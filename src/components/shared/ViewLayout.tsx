import styled from 'styled-components';

/**
 * Shared layout components used across TableView and WaterfallChart
 * to maintain consistent split-panel layout behavior
 */

/**
 * Main wrapper for split-panel layout (when entry is selected)
 * Creates a 25% list panel and 75% details panel
 */
export const Wrapper = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

/**
 * Left panel showing the list of entries (25% width)
 */
export const ListPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 25%;
  min-width: 300px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

/**
 * Right panel showing entry details (75% width)
 */
export const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

/**
 * Empty state message for details panel
 */
export const EmptyDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

/**
 * Full-width container for list view (when no entry is selected)
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;
