import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ThemeToggle } from '@components/ThemeToggle';
import { FileUpload } from '@components/FileUpload';
import { SummaryDashboard } from '@components/SummaryDashboard';
import { WaterfallChart } from '@components/WaterfallChart';
import { TableView } from '@components/TableView';
import { Sidebar } from '@components/Sidebar';
import { useHAR } from '@contexts/HARContext';
import type { FilterType } from './types/filters';
import { useCustomFiltersStore } from './stores/customFiltersStore';
import { calculateFilterCounts } from './utils/filterUtils';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FileInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ClearButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.error};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 2px;
`;

const ViewButton = styled.button.attrs<{ $active: boolean }>(({ theme, $active }) => ({
  style: {
    backgroundColor: $active ? theme.colors.primary : 'transparent',
    color: $active ? '#ffffff' : theme.colors.text,
  },
}))<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.hover};
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const EmptyStateTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyStateText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  flex: 1;
  overflow: hidden;
`;

const Placeholder = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
`;

type ViewMode = 'waterfall' | 'table';

function App() {
  const { har, entries, fileName, clearHAR } = useHAR();
  const { filters: customFilters } = useCustomFiltersStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('waterfall');

  const filterCounts = useMemo(() => {
    return calculateFilterCounts(entries, customFilters);
  }, [entries, customFilters]);

  return (
    <AppContainer>
      <Header>
        <HeaderLeft>
          <Title>
            HAR <span>Viewer</span>
          </Title>
          {har && fileName && (
            <>
              <FileInfo>
                {fileName} • {entries.length} requests
              </FileInfo>
              <ViewToggle>
                <ViewButton $active={viewMode === 'table'} onClick={() => setViewMode('table')}>
                  📋 Table
                </ViewButton>
                <ViewButton $active={viewMode === 'waterfall'} onClick={() => setViewMode('waterfall')}>
                  📊 Waterfall
                </ViewButton>
              </ViewToggle>
              <ClearButton onClick={clearHAR}>Clear</ClearButton>
            </>
          )}
        </HeaderLeft>
        <ThemeToggle />
      </Header>
      <MainContent>
        {!har ? (
          <Main>
            <EmptyState>
              <EmptyStateTitle>Welcome to HAR Viewer</EmptyStateTitle>
              <EmptyStateText>
                Upload a HAR file to visualize network requests and performance metrics
              </EmptyStateText>
              <FileUpload />
            </EmptyState>
          </Main>
        ) : (
          <>
            <Sidebar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              filterCounts={filterCounts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <Main>
              <ContentContainer>
                <SummaryDashboard />
                {viewMode === 'waterfall' ? (
                  <WaterfallChart activeFilter={activeFilter} searchTerm={searchTerm} />
                ) : (
                  <TableView activeFilter={activeFilter} searchTerm={searchTerm} />
                )}
              </ContentContainer>
            </Main>
          </>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
