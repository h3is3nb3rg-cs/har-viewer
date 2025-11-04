import { useState } from 'react';
import styled from 'styled-components';
import type { FilterType } from '../types/filters';
import { BUILT_IN_FILTERS } from '../types/filters';
import { useCustomFiltersStore } from '../stores/customFiltersStore';
import { FilterManageModal } from './FilterManageModal';
import type { CustomFilter } from '../types/filters';

const SidebarContainer = styled.aside`
  width: 280px;
  min-width: 280px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const SidebarTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FilterItem = styled.button.attrs<{ $active: boolean }>(({ theme, $active }) => ({
  style: {
    backgroundColor: $active ? theme.colors.primary : 'transparent',
    color: $active ? '#ffffff' : theme.colors.text,
    borderColor: $active ? theme.colors.primary : theme.colors.border,
  },
}))<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-width: 1px;
  border-style: solid;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-align: left;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.hover};
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(0);
  }
`;

const FilterIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  line-height: 1;
  flex-shrink: 0;
`;

const FilterContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const FilterDescription = styled.span.attrs<{ $active: boolean }>(({ $active }) => ({
  style: {
    color: $active ? 'rgba(255,255,255,0.8)' : '#888',
  },
}))<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-top: 2px;
`;

const FilterCount = styled.span.attrs<{ $active: boolean }>(({ $active }) => ({
  style: {
    backgroundColor: $active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
  },
}))<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-left: auto;
`;

const SearchContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ManageButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const CustomFilterItem = styled.div`
  position: relative;

  &:hover .filter-actions {
    opacity: 1;
  }
`;

const FilterActions = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  z-index: 1;
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  line-height: 1;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    transform: scale(1.1);
  }
`;

interface SidebarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filterCounts: Record<FilterType, number>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Sidebar = ({ activeFilter, onFilterChange, filterCounts, searchTerm, onSearchChange }: SidebarProps) => {
  const { filters: customFilters, deleteFilter } = useCustomFiltersStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<CustomFilter | undefined>();

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
    <SidebarContainer>
      <SidebarTitle>Search</SidebarTitle>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Filter by endpoint..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </SearchContainer>

      <SidebarTitle>Filters</SidebarTitle>
      <ManageButton onClick={handleAddFilter}>
        + Add Custom Filter
      </ManageButton>

      <FilterList>
        {/* Built-in Filters */}
        {BUILT_IN_FILTERS.map((option) => (
          <FilterItem
            key={option.id}
            $active={activeFilter === option.id}
            onClick={() => onFilterChange(option.id)}
          >
            <FilterIcon>{option.icon}</FilterIcon>
            <FilterContent>
              <FilterLabel>{option.label}</FilterLabel>
              <FilterDescription $active={activeFilter === option.id}>
                {option.description}
              </FilterDescription>
            </FilterContent>
            <FilterCount $active={activeFilter === option.id}>
              {filterCounts[option.id] || 0}
            </FilterCount>
          </FilterItem>
        ))}

        {/* Divider between built-in and custom filters */}
        {customFilters.length > 0 && <SectionDivider />}

        {/* Custom Filters */}
        {customFilters.map((filter) => (
          <CustomFilterItem key={filter.id}>
            <FilterItem
              $active={activeFilter === filter.id}
              onClick={() => onFilterChange(filter.id)}
            >
              <FilterIcon>{filter.icon}</FilterIcon>
              <FilterContent>
                <FilterLabel>{filter.name}</FilterLabel>
                <FilterDescription $active={activeFilter === filter.id}>
                  {filter.description}
                </FilterDescription>
              </FilterContent>
              <FilterCount $active={activeFilter === filter.id}>
                {filterCounts[filter.id] || 0}
              </FilterCount>
            </FilterItem>
            <FilterActions className="filter-actions">
              <ActionButton
                onClick={(e) => handleEditFilter(filter, e)}
                title="Edit filter"
              >
                ✏️
              </ActionButton>
              <ActionButton
                onClick={(e) => handleDeleteFilter(filter.id, e)}
                title="Delete filter"
              >
                🗑️
              </ActionButton>
            </FilterActions>
          </CustomFilterItem>
        ))}
      </FilterList>

      <FilterManageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingFilter={editingFilter}
      />
    </SidebarContainer>
  );
};
