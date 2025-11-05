import { useMemo, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useHAR } from '@contexts/HARContext';
import { WaterfallRow } from './WaterfallRow';

const RequestInspector = lazy(() => import('./RequestInspector').then(module => ({ default: module.RequestInspector })));
import { calculateWaterfallData, getTimeMarkers } from '@utils/waterfallCalculations';
import type { FilterType } from '../types/filters';
import { useCustomFiltersStore } from '../stores/customFiltersStore';
import { applyFilters } from '../utils/filterUtils';
import { Wrapper, ListPanel, DetailsPanel, Container } from './shared/ViewLayout';

const Header = styled.div`
  display: grid;
  grid-template-columns: 50px minmax(200px, 300px) 1fr 100px;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  position: sticky;
  top: 0;
  z-index: 10;
  min-width: 600px;
`;

const HeaderCell = styled.div<{ $align?: string }>`
  text-align: ${({ $align }) => $align || 'left'};
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const TimelineHeader = styled.div`
  position: relative;
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const TimelineMarkers = styled.div`
  position: relative;
  height: 20px;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const TimeMarker = styled.div<{ $position: number }>`
  position: absolute;
  left: ${({ $position }) => $position}%;
  transform: translateX(-50%);
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    width: 1px;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 12px;
  background-color: ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

interface WaterfallChartProps {
  activeFilter: FilterType;
  searchTerm: string;
}

export const WaterfallChart = ({ activeFilter, searchTerm }: WaterfallChartProps) => {
  const { entries, selectedEntry, selectEntry } = useHAR();
  const { filters: customFilters } = useCustomFiltersStore();

  const filteredEntries = useMemo(() => {
    return applyFilters(entries, activeFilter, customFilters, searchTerm);
  }, [entries, activeFilter, customFilters, searchTerm]);

  const waterfallData = useMemo(() => {
    return calculateWaterfallData(filteredEntries);
  }, [filteredEntries]);

  const timeMarkers = useMemo(() => {
    return getTimeMarkers(waterfallData.totalDuration);
  }, [waterfallData.totalDuration]);

  if (entries.length === 0) {
    return (
      <Container>
        <EmptyState>No entries to display</EmptyState>
      </Container>
    );
  }

  const listContent = (
    <>
      <Header>
        <HeaderCell $align="center">#</HeaderCell>
        <HeaderCell>Name</HeaderCell>
        <TimelineHeader>
          Timeline
          <TimelineMarkers>
            {timeMarkers.map((marker, index) => (
              <TimeMarker key={index} $position={marker.position}>
                {marker.label}
              </TimeMarker>
            ))}
          </TimelineMarkers>
        </TimelineHeader>
        <HeaderCell $align="right">Time</HeaderCell>
      </Header>
      <Body>
        {waterfallData.entries.map((entry, index) => (
          <WaterfallRow
            key={`${entry.index}-${entry.request.url}`}
            entry={entry}
            bar={waterfallData.bars[index]}
            isSelected={selectedEntry?.index === entry.index}
            onClick={() => selectEntry(entry)}
          />
        ))}
      </Body>
      <Legend>
        <LegendItem>
          <LegendColor $color="#6c757d" />
          Blocked
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#20c997" />
          DNS
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#fd7e14" />
          Connect
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#d63384" />
          SSL
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#0dcaf0" />
          Send
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#ffc107" />
          Wait
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#0d6efd" />
          Receive
        </LegendItem>
      </Legend>
    </>
  );

  if (!selectedEntry) {
    return (
      <Container>
        {listContent}
      </Container>
    );
  }

  return (
    <Wrapper>
      <ListPanel>
        {listContent}
      </ListPanel>

      <DetailsPanel>
        <Suspense fallback={<LoadingContainer>Loading details...</LoadingContainer>}>
          <RequestInspector />
        </Suspense>
      </DetailsPanel>
    </Wrapper>
  );
};
