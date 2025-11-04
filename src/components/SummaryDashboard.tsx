import { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHAR } from '@contexts/HARContext';
import { formatBytes, formatDuration } from '@utils/harParser';
import type { ResourceType, SummaryStats } from '@types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const ToggleIcon = styled.span<{ $isCollapsed: boolean }>`
  display: inline-block;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  transition: transform ${({ theme }) => theme.transitions.fast};
  transform: ${({ $isCollapsed }) => ($isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)')};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CollapseContainer = styled.div<{ $isCollapsed: boolean }>`
  max-height: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '2000px')};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.normal};
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CardTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.5px;
`;

const CardValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

const CardSubtext = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const BreakdownCard = styled(Card)`
  grid-column: span 2;

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const BreakdownItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const BreakdownLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const BreakdownValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

export const SummaryDashboard = () => {
  const { entries } = useHAR();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('summary-dashboard-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('summary-dashboard-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const stats = useMemo((): SummaryStats => {
    if (entries.length === 0) {
      return {
        totalRequests: 0,
        totalSize: 0,
        totalCompressedSize: 0,
        totalTime: 0,
        dnsTime: 0,
        connectTime: 0,
        sslTime: 0,
        sendTime: 0,
        waitTime: 0,
        receiveTime: 0,
        blockedTime: 0,
        requestsByType: {} as Record<ResourceType, number>,
        requestsByStatus: {},
        domains: [],
      };
    }

    const totalRequests = entries.length;
    let totalSize = 0;
    let totalCompressedSize = 0;
    let totalTime = 0;
    let dnsTime = 0;
    let connectTime = 0;
    let sslTime = 0;
    let sendTime = 0;
    let waitTime = 0;
    let receiveTime = 0;
    let blockedTime = 0;

    const requestsByType: Record<ResourceType, number> = {
      html: 0,
      css: 0,
      javascript: 0,
      image: 0,
      font: 0,
      xhr: 0,
      fetch: 0,
      websocket: 0,
      media: 0,
      manifest: 0,
      other: 0,
    };

    const requestsByStatus: Record<number, number> = {};
    const domainsSet = new Set<string>();

    entries.forEach((entry) => {
      // Size
      totalSize += entry.response.content.size;
      if (entry.response.content.compression) {
        totalCompressedSize += entry.response.content.size;
      }

      // Time
      totalTime += entry.time;

      // Timings
      if (entry.timings.dns && entry.timings.dns >= 0) dnsTime += entry.timings.dns;
      if (entry.timings.connect && entry.timings.connect >= 0) connectTime += entry.timings.connect;
      if (entry.timings.ssl && entry.timings.ssl >= 0) sslTime += entry.timings.ssl;
      sendTime += entry.timings.send;
      waitTime += entry.timings.wait;
      receiveTime += entry.timings.receive;
      if (entry.timings.blocked && entry.timings.blocked >= 0) blockedTime += entry.timings.blocked;

      // By type
      requestsByType[entry.resourceType]++;

      // By status
      const status = entry.response.status;
      requestsByStatus[status] = (requestsByStatus[status] || 0) + 1;

      // Domains
      domainsSet.add(entry.domain);
    });

    return {
      totalRequests,
      totalSize,
      totalCompressedSize,
      totalTime,
      dnsTime,
      connectTime,
      sslTime,
      sendTime,
      waitTime,
      receiveTime,
      blockedTime,
      requestsByType,
      requestsByStatus,
      domains: Array.from(domainsSet),
    };
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  const topResourceTypes = Object.entries(stats.requestsByType)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 6);

  return (
    <Wrapper>
      <Header onClick={() => setIsCollapsed(!isCollapsed)}>
        <HeaderTitle>Summary Statistics</HeaderTitle>
        <ToggleIcon $isCollapsed={isCollapsed}>▼</ToggleIcon>
      </Header>
      <CollapseContainer $isCollapsed={isCollapsed}>
        <Container>
      <Card>
        <CardTitle>Total Requests</CardTitle>
        <CardValue>{stats.totalRequests}</CardValue>
        <CardSubtext>{stats.domains.length} domains</CardSubtext>
      </Card>

      <Card>
        <CardTitle>Total Size</CardTitle>
        <CardValue>{formatBytes(stats.totalSize)}</CardValue>
        {stats.totalCompressedSize > 0 && (
          <CardSubtext>
            {formatBytes(stats.totalCompressedSize)} compressed
          </CardSubtext>
        )}
      </Card>

      <Card>
        <CardTitle>Total Time</CardTitle>
        <CardValue>{formatDuration(stats.totalTime)}</CardValue>
        <CardSubtext>cumulative</CardSubtext>
      </Card>

      <Card>
        <CardTitle>Avg. Response Time</CardTitle>
        <CardValue>{formatDuration(stats.totalTime / stats.totalRequests)}</CardValue>
        <CardSubtext>per request</CardSubtext>
      </Card>

      <BreakdownCard>
        <CardTitle>Requests by Type</CardTitle>
        <BreakdownGrid>
          {topResourceTypes.map(([type, count]) => (
            <BreakdownItem key={type}>
              <BreakdownLabel>{type}</BreakdownLabel>
              <BreakdownValue>{count}</BreakdownValue>
            </BreakdownItem>
          ))}
        </BreakdownGrid>
      </BreakdownCard>

      <BreakdownCard>
        <CardTitle>Timing Breakdown</CardTitle>
        <BreakdownGrid>
          {stats.dnsTime > 0 && (
            <BreakdownItem>
              <BreakdownLabel>DNS</BreakdownLabel>
              <BreakdownValue>{formatDuration(stats.dnsTime)}</BreakdownValue>
            </BreakdownItem>
          )}
          {stats.connectTime > 0 && (
            <BreakdownItem>
              <BreakdownLabel>Connect</BreakdownLabel>
              <BreakdownValue>{formatDuration(stats.connectTime)}</BreakdownValue>
            </BreakdownItem>
          )}
          {stats.sslTime > 0 && (
            <BreakdownItem>
              <BreakdownLabel>SSL</BreakdownLabel>
              <BreakdownValue>{formatDuration(stats.sslTime)}</BreakdownValue>
            </BreakdownItem>
          )}
          <BreakdownItem>
            <BreakdownLabel>Wait (TTFB)</BreakdownLabel>
            <BreakdownValue>{formatDuration(stats.waitTime)}</BreakdownValue>
          </BreakdownItem>
          <BreakdownItem>
            <BreakdownLabel>Receive</BreakdownLabel>
            <BreakdownValue>{formatDuration(stats.receiveTime)}</BreakdownValue>
          </BreakdownItem>
        </BreakdownGrid>
      </BreakdownCard>
    </Container>
      </CollapseContainer>
    </Wrapper>
  );
};
