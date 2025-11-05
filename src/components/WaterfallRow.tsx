import { memo } from 'react';
import styled from 'styled-components';
import type { EntryWithMetadata } from '@types';
import type { WaterfallBar } from '@utils/waterfallCalculations';
import { formatDuration } from '@utils/harParser';

interface WaterfallRowProps {
  entry: EntryWithMetadata;
  bar: WaterfallBar;
  isSelected: boolean;
  onClick: () => void;
}

const RowContainer = styled.div.attrs<{ $isSelected: boolean }>(({ theme, $isSelected }) => ({
  style: {
    backgroundColor: $isSelected ? theme.colors.selected : 'transparent',
  },
}))<{ $isSelected: boolean }>`
  display: grid;
  grid-template-columns: 50px minmax(200px, 300px) 1fr 100px;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  min-height: 32px;
  min-width: 600px;

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected ? theme.colors.selected : theme.colors.hover};
  }
`;

const Index = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  padding-right: ${({ theme }) => theme.spacing.sm};
`;

const FileName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Domain = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WaterfallContainer = styled.div`
  position: relative;
  height: 24px;
  margin: 0 ${({ theme }) => theme.spacing.sm};
`;

const WaterfallBarContainer = styled.div.attrs<{ $offset: number }>(({ $offset }) => ({
  style: {
    left: `${$offset}%`,
  },
}))<{ $offset: number }>`
  position: absolute;
  height: 100%;
  display: flex;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
`;

const Segment = styled.div.attrs<{ $type: string; $width: number }>(({ theme, $type, $width }) => {
  const colorMap: Record<string, string> = {
    blocked: theme.colors.blocked,
    dns: theme.colors.dns,
    connect: theme.colors.connect,
    ssl: theme.colors.ssl,
    send: theme.colors.send,
    wait: theme.colors.wait,
    receive: theme.colors.receive,
  };
  return {
    style: {
      width: `${$width}%`,
      backgroundColor: colorMap[$type] || theme.colors.other,
    },
  };
})<{ $type: string; $width: number }>`
  min-width: 2px;
  height: 100%;
  position: relative;

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    white-space: nowrap;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text};
    z-index: 1000;
    pointer-events: none;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const Time = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: right;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

const getSegmentTooltip = (type: string, duration: number): string => {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  return `${typeLabel}: ${formatDuration(duration)}`;
};

export const WaterfallRow = memo(({ entry, bar, isSelected, onClick }: WaterfallRowProps) => {
  return (
    <RowContainer $isSelected={isSelected} onClick={onClick}>
      <Index>{entry.index + 1}</Index>
      <NameContainer>
        <FileName title={entry.fileName}>{entry.fileName}</FileName>
        <Domain title={entry.domain}>{entry.domain}</Domain>
      </NameContainer>
      <WaterfallContainer>
        <WaterfallBarContainer $offset={bar.offset}>
          {bar.segments.map((segment, index) => (
            <Segment
              key={index}
              $type={segment.type}
              $width={(segment.width / bar.totalWidth) * 100}
              data-tooltip={getSegmentTooltip(segment.type, segment.duration)}
            />
          ))}
        </WaterfallBarContainer>
      </WaterfallContainer>
      <Time>{formatDuration(entry.time)}</Time>
    </RowContainer>
  );
});

WaterfallRow.displayName = 'WaterfallRow';
