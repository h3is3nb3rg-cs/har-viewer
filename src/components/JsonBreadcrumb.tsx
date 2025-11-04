import styled from 'styled-components';

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  overflow-x: auto;
  white-space: nowrap;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }
`;

const PathLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-right: ${({ theme }) => theme.spacing.xs};
  flex-shrink: 0;
`;

const Segment = styled.button<{ $isLast: boolean }>`
  background: none;
  border: none;
  color: ${({ theme, $isLast }) => $isLast ? theme.colors.primary : theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme, $isLast }) => $isLast ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  padding: ${({ theme }) => theme.spacing.xs};
  cursor: ${({ $isLast }) => $isLast ? 'default' : 'pointer'};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background-color: ${({ theme, $isLast }) => $isLast ? 'transparent' : theme.colors.hover};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: ${({ $isLast }) => $isLast ? 'none' : 'scale(0.95)'};
  }
`;

const Separator = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  user-select: none;
  flex-shrink: 0;
`;

const EmptyState = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

interface JsonBreadcrumbProps {
  path: string;
  onSegmentClick?: (segmentPath: string) => void;
}

export const JsonBreadcrumb = ({ path, onSegmentClick }: JsonBreadcrumbProps) => {
  if (!path || path === 'root') {
    return (
      <BreadcrumbContainer>
        <PathLabel>Path:</PathLabel>
        <EmptyState>root</EmptyState>
      </BreadcrumbContainer>
    );
  }

  // Split path into segments, handling both 'root.something' and 'something'
  const segments = path.startsWith('root.') ? path.split('.') : ['root', ...path.split('.')];

  const handleSegmentClick = (index: number) => {
    if (index === segments.length - 1) return; // Don't navigate on last segment

    const segmentPath = segments.slice(0, index + 1).join('.');
    onSegmentClick?.(segmentPath);
  };

  return (
    <BreadcrumbContainer>
      <PathLabel>Path:</PathLabel>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const isArray = !isNaN(Number(segment));
        const displaySegment = isArray ? `[${segment}]` : segment;

        return (
          <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Segment
              $isLast={isLast}
              onClick={() => handleSegmentClick(index)}
              title={isLast ? 'Current location' : `Navigate to ${segments.slice(0, index + 1).join('.')}`}
            >
              {displaySegment}
            </Segment>
            {!isLast && <Separator>›</Separator>}
          </span>
        );
      })}
    </BreadcrumbContainer>
  );
};
