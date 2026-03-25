import { useState } from 'react';
import styled from 'styled-components';
import { List, AlertTriangle, XCircle, AlertCircle, Pencil, X, Plus, ChevronDown } from 'lucide-react';
import type { FilterType, SearchScope } from '../types/filters';
import { BUILT_IN_FILTERS } from '../types/filters';
import { useCustomFiltersStore } from '../stores/customFiltersStore';
import { FilterManageModal } from './FilterManageModal';
import type { CustomFilter } from '../types/filters';

const ICON_MAP: Record<string, React.ReactNode> = {
  'list': <List size={14} />,
  'alert-triangle': <AlertTriangle size={14} />,
  'x-circle': <XCircle size={14} />,
  'alert-circle': <AlertCircle size={14} />,
};

const FilterBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-height: 56px;
  overflow-x: visible;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  max-width: 320px;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SearchActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 0 1 600px;
  min-width: 0;
  justify-content: flex-end;
`;

const SearchControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1 1 auto;
  min-width: 0;
`;

const ScopeDropdown = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ScopeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  white-space: nowrap;
  cursor: pointer;
`;

const ScopeMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 220px;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 1001;
`;

const ScopeOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
`;

const ScopeOptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ScopeOptionDescription = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const SEARCH_SCOPE_OPTIONS: Array<{
  value: SearchScope;
  label: string;
  description: string;
}> = [
  {
    value: 'payload-response',
    label: 'Payload + Response',
    description: 'Search request payloads and response bodies only.',
  },
  {
    value: 'all',
    label: 'Entire Request',
    description: 'Search headers, cookies, timings, URLs, payloads, and responses.',
  },
];

const FilterChipsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
  overflow-x: visible;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button.attrs<{ $active: boolean }>(({ theme, $active }) => ({
  style: {
    backgroundColor: $active ? theme.colors.primary : theme.colors.background,
    color: $active ? '#ffffff' : theme.colors.text,
    borderColor: $active ? theme.colors.primary : theme.colors.border,
  },
}))<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-width: 1px;
  border-style: solid;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.hover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChipIcon = styled.span`
  display: inline-flex;
  align-items: center;
  line-height: 1;
`;

const ChipCount = styled.span.attrs<{ $active: boolean }>(({ $active }) => ({
  style: {
    backgroundColor: $active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
  },
}))<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const AddFilterButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FilterActions = styled.div`
  position: absolute;
  right: -8px;
  top: -10px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  z-index: 1000;
`;

const ActionButton = styled.button`
  width: 26px;
  height: 26px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    transform: scale(1.2);
  }

  &:active {
    transform: scale(1.1);
  }
`;

const CustomChipWrapper = styled.div`
  position: relative;
  padding: 0 8px 0 0;

  &:hover ${FilterActions} {
    opacity: 1;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filterCounts: Record<FilterType, number>;
  searchTerm: string;
  searchScope: SearchScope;
  onSearchChange: (term: string) => void;
  onSearchScopeChange: (scope: SearchScope) => void;
}

export const FilterBar = ({
  activeFilter,
  onFilterChange,
  filterCounts,
  searchTerm,
  searchScope,
  onSearchChange,
  onSearchScopeChange,
}: FilterBarProps) => {
  const { filters: customFilters, deleteFilter } = useCustomFiltersStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<CustomFilter | undefined>();
  const [isScopeMenuOpen, setIsScopeMenuOpen] = useState(false);

  const handleEditFilter = (filter: CustomFilter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFilter(filter);
    setIsModalOpen(true);
  };

  const handleDeleteFilter = (filterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this filter?')) {
      deleteFilter(filterId);
      // If the deleted filter was active, switch to 'all'
      if (activeFilter === filterId) {
        onFilterChange('all');
      }
    }
  };

  const handleAddFilter = () => {
    setEditingFilter(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFilter(undefined);
  };

  return (
    <>
      <FilterBarContainer>
        <FilterChipsContainer>
          {/* Built-in Filters */}
          {BUILT_IN_FILTERS.map((option) => (
            <FilterChip
              key={option.id}
              $active={activeFilter === option.id}
              onClick={() => onFilterChange(option.id)}
              title={option.description}
            >
              <ChipIcon>{ICON_MAP[option.icon] ?? option.icon}</ChipIcon>
              <span>{option.label}</span>
              <ChipCount $active={activeFilter === option.id}>
                {filterCounts[option.id] || 0}
              </ChipCount>
            </FilterChip>
          ))}

          {/* Custom Filters */}
          {customFilters.map((filter) => (
            <CustomChipWrapper key={filter.id}>
              <FilterChip
                $active={activeFilter === filter.id}
                onClick={() => onFilterChange(filter.id)}
                title={filter.description}
              >
                <ChipIcon>{filter.icon}</ChipIcon>
                <span>{filter.name}</span>
                <ChipCount $active={activeFilter === filter.id}>
                  {filterCounts[filter.id] || 0}
                </ChipCount>
              </FilterChip>
              <FilterActions>
                <ActionButton
                  onClick={(e) => handleEditFilter(filter, e)}
                  title="Edit filter"
                >
                  <Pencil size={12} />
                </ActionButton>
                <ActionButton
                  onClick={(e) => handleDeleteFilter(filter.id, e)}
                  title="Delete filter"
                >
                  <X size={12} />
                </ActionButton>
              </FilterActions>
            </CustomChipWrapper>
          ))}
        </FilterChipsContainer>

        <Divider />

        <SearchActions>
          <SearchControls>
            <SearchInput
              type="text"
              placeholder={
                searchScope === 'payload-response'
                  ? 'Search payload and response...'
                  : 'Search across the full HAR...'
              }
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />

            <ScopeDropdown>
              <ScopeButton
                type="button"
                onClick={() => setIsScopeMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isScopeMenuOpen}
              >
                {SEARCH_SCOPE_OPTIONS.find((option) => option.value === searchScope)?.label}
                <ChevronDown size={14} />
              </ScopeButton>

              {isScopeMenuOpen && (
                <ScopeMenu role="menu">
                  {SEARCH_SCOPE_OPTIONS.map((option) => (
                    <ScopeOption key={option.value}>
                      <input
                        type="radio"
                        name="search-scope"
                        checked={searchScope === option.value}
                        onChange={() => {
                          onSearchScopeChange(option.value);
                          setIsScopeMenuOpen(false);
                        }}
                      />
                      <ScopeOptionText>
                        <span>{option.label}</span>
                        <ScopeOptionDescription>{option.description}</ScopeOptionDescription>
                      </ScopeOptionText>
                    </ScopeOption>
                  ))}
                </ScopeMenu>
              )}
            </ScopeDropdown>
          </SearchControls>

          <AddFilterButton onClick={handleAddFilter}>
            <Plus size={14} /> Add Filter
          </AddFilterButton>
        </SearchActions>
      </FilterBarContainer>

      <FilterManageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingFilter={editingFilter}
      />
    </>
  );
};
