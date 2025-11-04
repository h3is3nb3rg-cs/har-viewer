import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useHAR } from '@contexts/HARContext';
import type { FilterType } from '../types/filters';
import type { EntryWithMetadata } from '@types';
import { formatDuration, formatBytes, formatTimestamp } from '@utils/harParser';
import { useCustomFiltersStore } from '../stores/customFiltersStore';
import { applyFilters } from '../utils/filterUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Thead = styled.thead`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
  display: block;
  width: 100%;

  tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
`;

const Tbody = styled.tbody`
  flex: 1;
  display: block;
  overflow-y: auto;
  width: 100%;
`;

const Tr = styled.tr.attrs<{ $isSelected: boolean }>(({ theme, $isSelected }) => ({
  style: {
    backgroundColor: $isSelected ? theme.colors.selected : 'transparent',
  },
}))<{ $isSelected: boolean }>`
  display: table;
  width: 100%;
  table-layout: fixed;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected ? theme.colors.selected : theme.colors.hover};
  }
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const MethodBadge = styled.span<{ $method: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  background-color: ${({ $method, theme }) => {
    switch ($method) {
      case 'GET':
        return theme.colors.success + '20';
      case 'POST':
        return theme.colors.info + '20';
      case 'PUT':
      case 'PATCH':
        return theme.colors.warning + '20';
      case 'DELETE':
        return theme.colors.error + '20';
      default:
        return theme.colors.textMuted + '20';
    }
  }};
  color: ${({ $method, theme }) => {
    switch ($method) {
      case 'GET':
        return theme.colors.success;
      case 'POST':
        return theme.colors.info;
      case 'PUT':
      case 'PATCH':
        return theme.colors.warning;
      case 'DELETE':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  }};
`;

const StatusBadge = styled.span.attrs<{ $status: number }>(({ theme, $status }) => {
  let bgColor, textColor;
  if ($status >= 200 && $status < 300) {
    bgColor = theme.colors.status2xx + '20';
    textColor = theme.colors.status2xx;
  } else if ($status >= 300 && $status < 400) {
    bgColor = theme.colors.status3xx + '20';
    textColor = theme.colors.status3xx;
  } else if ($status >= 400 && $status < 500) {
    bgColor = theme.colors.status4xx + '20';
    textColor = theme.colors.status4xx;
  } else {
    bgColor = theme.colors.status5xx + '20';
    textColor = theme.colors.status5xx;
  }
  return {
    style: {
      backgroundColor: bgColor,
      color: textColor,
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

const EndpointCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EndpointName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
`;

const Domain = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
`;

const DetailsRow = styled.tr<{ $isExpanded: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
`;

const DetailsCell = styled.td`
  padding: 0;
`;

const DetailsContainer = styled.div<{ $isExpanded: boolean }>`
  max-height: ${({ $isExpanded }) => ($isExpanded ? '400px' : '0')};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.normal};
  border-top: ${({ $isExpanded, theme }) =>
    $isExpanded ? `1px solid ${theme.colors.border}` : 'none'};
`;

const DetailsContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DetailLabel = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  word-break: break-all;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  display: inline-block;
  margin-right: ${({ theme }) => theme.spacing.xs};
  transition: transform ${({ theme }) => theme.transitions.fast};
  transform: ${({ $isExpanded }) => ($isExpanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

interface TableViewProps {
  activeFilter: FilterType;
  searchTerm: string;
}

export const TableView = ({ activeFilter, searchTerm }: TableViewProps) => {
  const { entries } = useHAR();
  const { filters: customFilters } = useCustomFiltersStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredEntries = useMemo(() => {
    return applyFilters(entries, activeFilter, customFilters, searchTerm);
  }, [entries, activeFilter, customFilters, searchTerm]);

  const handleRowClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (entries.length === 0) {
    return (
      <Container>
        <EmptyState>No entries to display</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Table>
        <Thead>
          <tr>
            <Th>Method</Th>
            <Th>Endpoint</Th>
            <Th>Status</Th>
            <Th>Size</Th>
            <Th>Time</Th>
          </tr>
        </Thead>
        <Tbody>
          {filteredEntries.map((entry) => {
            const isExpanded = expandedIndex === entry.index;
            return (
              <>
                <Tr key={entry.index} $isSelected={isExpanded} onClick={() => handleRowClick(entry.index)}>
                  <Td>
                    <ExpandIcon $isExpanded={isExpanded}>▶</ExpandIcon>
                    <MethodBadge $method={entry.request.method}>{entry.request.method}</MethodBadge>
                  </Td>
                  <Td>
                    <EndpointCell>
                      <EndpointName title={entry.fileName}>{entry.fileName}</EndpointName>
                      <Domain title={entry.domain}>{entry.domain}</Domain>
                    </EndpointCell>
                  </Td>
                  <Td>
                    <StatusBadge $status={entry.response.status}>{entry.response.status}</StatusBadge>
                  </Td>
                  <Td>{formatBytes(entry.response.content.size)}</Td>
                  <Td>{formatDuration(entry.time)}</Td>
                </Tr>
                <DetailsRow $isExpanded={isExpanded}>
                  <DetailsCell colSpan={5}>
                    <DetailsContainer $isExpanded={isExpanded}>
                      <DetailsContent>
                        <DetailSection>
                          <DetailLabel>URL</DetailLabel>
                          <DetailValue>{entry.request.url}</DetailValue>
                        </DetailSection>
                        <DetailSection>
                          <DetailLabel>Started</DetailLabel>
                          <DetailValue>{formatTimestamp(entry.startedDateTime)}</DetailValue>
                        </DetailSection>
                        <DetailSection>
                          <DetailLabel>Content Type</DetailLabel>
                          <DetailValue>{entry.response.content.mimeType}</DetailValue>
                        </DetailSection>
                        <DetailSection>
                          <DetailLabel>Server IP</DetailLabel>
                          <DetailValue>{entry.serverIPAddress || 'N/A'}</DetailValue>
                        </DetailSection>
                      </DetailsContent>
                    </DetailsContainer>
                  </DetailsCell>
                </DetailsRow>
              </>
            );
          })}
        </Tbody>
      </Table>
    </Container>
  );
};
