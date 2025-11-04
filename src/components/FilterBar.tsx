import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  user-select: none;
`;

const ToggleSwitch = styled.div<{ $checked: boolean }>`
  position: relative;
  width: 44px;
  height: 24px;
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $checked }) => ($checked ? '22px' : '2px')};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left ${({ theme }) => theme.transitions.fast};
  }
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const FilterCount = styled.span`
  margin-left: auto;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface FilterBarProps {
  totalCount: number;
  filteredCount: number;
  showOnlyPrism: boolean;
  onTogglePrism: (value: boolean) => void;
}

export const FilterBar = ({
  totalCount,
  filteredCount,
  showOnlyPrism,
  onTogglePrism,
}: FilterBarProps) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePrism(!showOnlyPrism);
  };

  return (
    <Container>
      <Label onClick={handleToggle}>
        <HiddenCheckbox
          type="checkbox"
          checked={showOnlyPrism}
          onChange={() => {}}
        />
        <ToggleSwitch $checked={showOnlyPrism} />
        Show only Prism requests
      </Label>
      {showOnlyPrism && (
        <FilterCount>
          {filteredCount} of {totalCount} requests
        </FilterCount>
      )}
    </Container>
  );
};
