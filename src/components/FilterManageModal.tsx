import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import type { CustomFilter, PatternType } from '../types/filters';
import { useCustomFiltersStore } from '../stores/customFiltersStore';
import { useHAR } from '../contexts/HARContext';
import { matchesCustomFilter, validatePattern } from '../utils/filterUtils';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  line-height: 1;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 2px ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)}33;
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  min-height: 60px;
  resize: vertical;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 2px ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)}33;
  }
`;

const PatternTypeToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 2px;
`;

const PatternTypeButton = styled.button.attrs<{ $active: boolean }>(({ theme, $active }) => ({
  style: {
    backgroundColor: $active ? theme.colors.primary : 'transparent',
    color: $active ? '#ffffff' : theme.colors.text,
  },
}))<{ $active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.hover};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-top: -${({ theme }) => theme.spacing.xs};
`;

const PreviewSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PreviewLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const PreviewValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  background-color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.backgroundTertiary};
  color: ${({ theme, $variant }) =>
    $variant === 'primary' ? '#ffffff' : theme.colors.text};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HelpText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: -${({ theme }) => theme.spacing.xs};
`;

interface FilterManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFilter?: CustomFilter;
}

export const FilterManageModal = ({ isOpen, onClose, editingFilter }: FilterManageModalProps) => {
  const { entries } = useHAR();
  const { addFilter, updateFilter } = useCustomFiltersStore();

  const [name, setName] = useState('');
  const [pattern, setPattern] = useState('');
  const [patternType, setPatternType] = useState<PatternType>('path');
  const [icon, setIcon] = useState('🔷');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; pattern?: string }>({});

  // Initialize form with editing filter data
  useEffect(() => {
    if (editingFilter) {
      setName(editingFilter.name);
      setPattern(editingFilter.pattern);
      setPatternType(editingFilter.patternType);
      setIcon(editingFilter.icon);
      setDescription(editingFilter.description);
    } else {
      // Reset form
      setName('');
      setPattern('');
      setPatternType('path');
      setIcon('🔷');
      setDescription('');
    }
    setErrors({});
  }, [editingFilter, isOpen]);

  // Calculate preview count
  const matchCount = useMemo(() => {
    if (!pattern || !pattern.trim()) return 0;

    const validation = validatePattern(pattern, patternType);
    if (!validation.isValid) return 0;

    const tempFilter: CustomFilter = {
      id: 'preview',
      name,
      pattern,
      patternType,
      icon,
      description,
      createdAt: Date.now(),
    };

    return entries.filter((entry) => matchesCustomFilter(entry.request.url, tempFilter)).length;
  }, [pattern, patternType, entries, name, icon, description]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; pattern?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Filter name is required';
    }

    if (!pattern.trim()) {
      newErrors.pattern = 'Pattern is required';
    } else {
      const validation = validatePattern(pattern, patternType);
      if (!validation.isValid) {
        newErrors.pattern = validation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingFilter) {
      updateFilter(editingFilter.id, {
        name,
        pattern,
        patternType,
        icon,
        description,
      });
    } else {
      addFilter({
        name,
        pattern,
        patternType,
        icon,
        description,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{editingFilter ? 'Edit Filter' : 'Add New Filter'}</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="filter-name">Filter Name *</Label>
            <Input
              id="filter-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Example API"
              $hasError={!!errors.name}
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="filter-icon">Icon</Label>
            <Input
              id="filter-icon"
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🔷"
              maxLength={2}
            />
            <HelpText>Single emoji character</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Pattern Type</Label>
            <PatternTypeToggle>
              <PatternTypeButton
                type="button"
                $active={patternType === 'path'}
                onClick={() => setPatternType('path')}
              >
                Path Match
              </PatternTypeButton>
              <PatternTypeButton
                type="button"
                $active={patternType === 'regex'}
                onClick={() => setPatternType('regex')}
              >
                Regex
              </PatternTypeButton>
            </PatternTypeToggle>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="filter-pattern">
              Pattern * {patternType === 'path' ? '(URL path contains)' : '(Regular expression)'}
            </Label>
            <Input
              id="filter-pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={patternType === 'path' ? '/api/example/' : '/api/example/i'}
              $hasError={!!errors.pattern}
              style={{ fontFamily: 'monospace' }}
            />
            {errors.pattern && <ErrorMessage>{errors.pattern}</ErrorMessage>}
            <HelpText>
              {patternType === 'path'
                ? 'Match URLs containing this path (case-insensitive)'
                : 'JavaScript regular expression to match URLs'}
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="filter-description">Description</Label>
            <TextArea
              id="filter-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this filter matches"
            />
          </FormGroup>

          {pattern && (
            <PreviewSection>
              <PreviewLabel>Preview</PreviewLabel>
              <PreviewValue>
                {matchCount} of {entries.length} requests match this pattern
              </PreviewValue>
            </PreviewSection>
          )}

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" $variant="primary">
              {editingFilter ? 'Update Filter' : 'Add Filter'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};
