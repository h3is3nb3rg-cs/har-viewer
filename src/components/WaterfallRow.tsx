import { useState } from 'react';
import styled from 'styled-components';
import type { EntryWithMetadata } from '@types';
import type { WaterfallBar } from '@utils/waterfallCalculations';
import { formatDuration, formatBytes, formatTimestamp } from '@utils/harParser';
import { JsonViewer, JsonSearchBar } from './JsonViewer';

type Tab = 'general' | 'headers' | 'payload' | 'response';

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
  grid-template-columns: 50px 300px 1fr 100px;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  min-height: 32px;

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected ? theme.colors.selected : theme.colors.hover};
  }
`;

const IndexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  display: inline-block;
  transition: transform ${({ theme }) => theme.transitions.fast};
  transform: ${({ $isExpanded }) => ($isExpanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 10px;
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

const DetailsContainer = styled.div<{ $isExpanded: boolean }>`
  grid-column: 1 / -1;
  max-height: ${({ $isExpanded }) => ($isExpanded ? '600px' : '0')};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.normal};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border-top: ${({ $isExpanded, theme }) =>
    $isExpanded ? `1px solid ${theme.colors.border}` : 'none'};
`;

const DetailsContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  overflow-y: auto;
  max-height: 580px;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TabButton = styled.button.attrs<{ $active: boolean }>(({ theme, $active }) => ({
  style: {
    backgroundColor: $active ? theme.colors.primary : 'transparent',
    color: $active ? '#ffffff' : theme.colors.text,
  },
}))<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.hover};
  }
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderRight = styled.div`
  flex: 0 0 300px;
  min-width: 300px;
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow-x: auto;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text};
  max-height: 300px;
  overflow-y: auto;
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
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const RowWrapper = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const MainRow = styled.div`
  display: contents;
`;

export const WaterfallRow = ({ entry, bar, isSelected, onClick }: WaterfallRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [payloadSearchTerm, setPayloadSearchTerm] = useState<string>('');
  const [responseSearchTerm, setResponseSearchTerm] = useState<string>('');
  const [payloadMatchIndex, setPayloadMatchIndex] = useState<number>(0);
  const [responseMatchIndex, setResponseMatchIndex] = useState<number>(0);

  const getSegmentTooltip = (type: string, duration: number) => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return `${typeLabel}: ${formatDuration(duration)}`;
  };

  const isJsonContent = (text: string, mimeType: string): boolean => {
    // Check MIME type first
    if (mimeType.includes('json')) {
      return true;
    }

    // Try to parse as JSON
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleRowClick = () => {
    setIsExpanded(!isExpanded);
    onClick();
  };

  const { request, response } = entry;

  const renderGeneralTab = () => (
    <>
      <Section>
        <SectionTitle>Request</SectionTitle>
        <InfoGrid>
          <Label>URL:</Label>
          <Value>{request.url}</Value>
          <Label>Method:</Label>
          <Value>{request.method}</Value>
          <Label>HTTP Version:</Label>
          <Value>{request.httpVersion}</Value>
          <Label>Server IP:</Label>
          <Value>{entry.serverIPAddress || 'N/A'}</Value>
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>Response</SectionTitle>
        <InfoGrid>
          <Label>Status:</Label>
          <Value>
            <StatusBadge $status={response.status}>
              {response.status} {response.statusText}
            </StatusBadge>
          </Value>
          <Label>HTTP Version:</Label>
          <Value>{response.httpVersion}</Value>
          <Label>Content Type:</Label>
          <Value>{response.content.mimeType}</Value>
          <Label>Content Size:</Label>
          <Value>
            {formatBytes(response.content.size)}
            {response.content.compression && response.content.compression > 0 && (
              <> (compressed from {formatBytes(response.content.size + response.content.compression)})</>
            )}
          </Value>
          <Label>Started:</Label>
          <Value>{formatTimestamp(entry.startedDateTime)}</Value>
          <Label>Duration:</Label>
          <Value>{formatDuration(entry.time)}</Value>
        </InfoGrid>
      </Section>
    </>
  );

  const renderHeadersTab = () => (
    <>
      <Section>
        <SectionTitle>Request Headers ({request.headers.length})</SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Value</Th>
            </tr>
          </thead>
          <tbody>
            {request.headers.map((header, index) => (
              <tr key={index}>
                <Td>{header.name}</Td>
                <Td>{header.value}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section>
        <SectionTitle>Response Headers ({response.headers.length})</SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Value</Th>
            </tr>
          </thead>
          <tbody>
            {response.headers.map((header, index) => (
              <tr key={index}>
                <Td>{header.name}</Td>
                <Td>{header.value}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
    </>
  );

  const renderPayloadTab = () => {
    if (!request.postData) {
      return <EmptyState>No payload data</EmptyState>;
    }

    const showAsJson = request.postData.text && isJsonContent(request.postData.text, request.postData.mimeType);

    return (
      <Section>
        <SectionTitle>Request Payload</SectionTitle>
        <HeaderRow>
          <HeaderLeft>
            <InfoGrid>
              <Label>MIME Type:</Label>
              <Value>{request.postData.mimeType}</Value>
            </InfoGrid>
          </HeaderLeft>
          {showAsJson && (
            <HeaderRight>
              <JsonSearchBar
                searchTerm={payloadSearchTerm}
                onSearchChange={(term) => {
                  setPayloadSearchTerm(term);
                  setPayloadMatchIndex(0);
                }}
                data={request.postData.text}
                currentMatchIndex={payloadMatchIndex}
                onMatchIndexChange={setPayloadMatchIndex}
              />
            </HeaderRight>
          )}
        </HeaderRow>
        {request.postData.text && (
          showAsJson ? (
            <JsonViewer
              data={request.postData.text}
              searchTerm={payloadSearchTerm}
              currentMatchIndex={payloadMatchIndex}
              onMatchIndexChange={setPayloadMatchIndex}
              showBreadcrumb={true}
            />
          ) : (
            <CodeBlock>{request.postData.text}</CodeBlock>
          )
        )}
        {request.postData.params && request.postData.params.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Value</Th>
              </tr>
            </thead>
            <tbody>
              {request.postData.params.map((param, index) => (
                <tr key={index}>
                  <Td>{param.name}</Td>
                  <Td>{param.value || 'N/A'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    );
  };

  const renderResponseTab = () => {
    const { content } = response;
    const showAsJson = content.text && content.encoding !== 'base64' && isJsonContent(content.text, content.mimeType);

    return (
      <Section>
        <SectionTitle>Response Content</SectionTitle>
        <HeaderRow>
          <HeaderLeft>
            <InfoGrid>
              <Label>MIME Type:</Label>
              <Value>{content.mimeType}</Value>
              <Label>Size:</Label>
              <Value>{formatBytes(content.size)}</Value>
              {content.encoding && (
                <>
                  <Label>Encoding:</Label>
                  <Value>{content.encoding}</Value>
                </>
              )}
            </InfoGrid>
          </HeaderLeft>
          {showAsJson && (
            <HeaderRight>
              <JsonSearchBar
                searchTerm={responseSearchTerm}
                onSearchChange={(term) => {
                  setResponseSearchTerm(term);
                  setResponseMatchIndex(0);
                }}
                data={content.text}
                currentMatchIndex={responseMatchIndex}
                onMatchIndexChange={setResponseMatchIndex}
              />
            </HeaderRight>
          )}
        </HeaderRow>
        {content.text && content.encoding !== 'base64' && (
          showAsJson ? (
            <JsonViewer
              data={content.text}
              searchTerm={responseSearchTerm}
              currentMatchIndex={responseMatchIndex}
              onMatchIndexChange={setResponseMatchIndex}
              showBreadcrumb={true}
            />
          ) : (
            <CodeBlock>{content.text.substring(0, 5000)}{content.text.length > 5000 && '...'}</CodeBlock>
          )
        )}
        {content.encoding === 'base64' && (
          <EmptyState>Binary content (base64 encoded)</EmptyState>
        )}
        {!content.text && <EmptyState>No content available</EmptyState>}
      </Section>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'headers':
        return renderHeadersTab();
      case 'payload':
        return renderPayloadTab();
      case 'response':
        return renderResponseTab();
      default:
        return null;
    }
  };

  return (
    <RowWrapper>
      <MainRow>
        <RowContainer $isSelected={isSelected} onClick={handleRowClick}>
          <IndexContainer>
            <ExpandIcon $isExpanded={isExpanded}>▶</ExpandIcon>
            <Index>{entry.index + 1}</Index>
          </IndexContainer>
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
        <DetailsContainer $isExpanded={isExpanded}>
          <DetailsContent>
            <Tabs>
              <TabButton $active={activeTab === 'general'} onClick={(e) => { e.stopPropagation(); setActiveTab('general'); }}>
                General
              </TabButton>
              <TabButton $active={activeTab === 'headers'} onClick={(e) => { e.stopPropagation(); setActiveTab('headers'); }}>
                Headers
              </TabButton>
              <TabButton $active={activeTab === 'payload'} onClick={(e) => { e.stopPropagation(); setActiveTab('payload'); }}>
                Payload
              </TabButton>
              <TabButton $active={activeTab === 'response'} onClick={(e) => { e.stopPropagation(); setActiveTab('response'); }}>
                Response
              </TabButton>
            </Tabs>
            {renderContent()}
          </DetailsContent>
        </DetailsContainer>
      </MainRow>
    </RowWrapper>
  );
};
