import { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { JsonBreadcrumb } from './JsonBreadcrumb';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SearchContainer = styled.div`
  position: relative;
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

const SearchStats = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const Container = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
`;

const Line = styled.div<{ $indent: number }>`
  padding-left: ${({ $indent }) => $indent * 20}px;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Highlight = styled.mark`
  background-color: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.background};
  padding: 1px 2px;
  border-radius: 2px;
`;

const Key = styled.span`
  color: ${({ theme }) => theme.colors.info};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const StringValue = styled.span<{ $isSelected?: boolean }>`
  color: ${({ theme }) => theme.colors.success};
  position: relative;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;

  ${({ $isSelected, theme }) => $isSelected && `
    background-color: ${theme.colors.primary}22;
    &::after {
      content: '';
      position: absolute;
      right: -2px;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 80%;
      background-color: ${theme.colors.primary};
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
  `}

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const NumberValue = styled.span<{ $isSelected?: boolean }>`
  color: ${({ theme }) => theme.colors.warning};
  position: relative;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;

  ${({ $isSelected, theme }) => $isSelected && `
    background-color: ${theme.colors.primary}22;
    &::after {
      content: '';
      position: absolute;
      right: -2px;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 80%;
      background-color: ${theme.colors.primary};
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
  `}

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const BooleanValue = styled.span<{ $isSelected?: boolean }>`
  color: ${({ theme }) => theme.colors.error};
  position: relative;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;

  ${({ $isSelected, theme }) => $isSelected && `
    background-color: ${theme.colors.primary}22;
    &::after {
      content: '';
      position: absolute;
      right: -2px;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 80%;
      background-color: ${theme.colors.primary};
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
  `}

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const NullValue = styled.span<{ $isSelected?: boolean }>`
  color: ${({ theme }) => theme.colors.textMuted};
  position: relative;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;

  ${({ $isSelected, theme }) => $isSelected && `
    background-color: ${theme.colors.primary}22;
    &::after {
      content: '';
      position: absolute;
      right: -2px;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 80%;
      background-color: ${theme.colors.primary};
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
  `}

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const Bracket = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const Comma = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyPlaceholder = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Expandable = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  margin-left: ${({ theme }) => theme.spacing.xs};
`;

interface JsonViewerProps {
  data: string | object;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  currentMatchIndex?: number;
  onMatchIndexChange?: (index: number) => void;
  showBreadcrumb?: boolean;
}

export const JsonViewer = ({
  data,
  searchTerm = '',
  onSearchChange,
  currentMatchIndex = 0,
  onMatchIndexChange,
  showBreadcrumb = false
}: JsonViewerProps) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const currentMatchRef = useRef<HTMLDivElement>(null);

  let parsedData: any;
  let parseError: string | null = null;

  // Parse if string, otherwise use as-is
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parseError = `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`;
    }
  } else {
    parsedData = data;
  }

  // Search for all matching paths
  const allMatchPaths = useMemo(() => {
    if (!searchTerm.trim() || !parsedData) return [];

    const matches: string[] = [];
    const searchLower = searchTerm.toLowerCase();

    const searchInValue = (value: any, path: string): void => {
      if (value === null || value === undefined) {
        if ('null'.includes(searchLower) || 'undefined'.includes(searchLower)) {
          matches.push(path);
        }
        return;
      }

      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) {
          searchInValue(value[index], `${path}.${index}`);
        }
      } else if (typeof value === 'object') {
        const keys = Object.keys(value);
        for (const key of keys) {
          const keyPath = `${path}.${key}`;
          // Check if key matches
          if (key.toLowerCase().includes(searchLower)) {
            matches.push(keyPath);
          }
          // Check if value matches
          searchInValue(value[key], keyPath);
        }
      } else {
        // Check primitive values
        const strValue = String(value).toLowerCase();
        if (strValue.includes(searchLower)) {
          matches.push(path);
        }
      }
    };

    searchInValue(parsedData, 'root');
    return matches;
  }, [parsedData, searchTerm]);

  // Get the current match path based on currentMatchIndex
  const currentMatchPath = allMatchPaths.length > 0 ? allMatchPaths[currentMatchIndex] : null;

  // Expand only the path to the current match and collapse everything else
  useEffect(() => {
    if (searchTerm.trim() && currentMatchPath) {
      const newExpandedPaths = new Set<string>();

      // Add only parent paths of the current match
      const parts = currentMatchPath.split('.');
      for (let i = 0; i < parts.length; i++) {
        const parentPath = parts.slice(0, i + 1).join('.');
        newExpandedPaths.add(parentPath);
      }

      setExpandedPaths(newExpandedPaths);

      // Scroll to current match after a short delay to let the DOM update
      setTimeout(() => {
        if (currentMatchRef.current) {
          currentMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (!searchTerm.trim()) {
      // Reset to default expanded state when search is cleared
      setExpandedPaths(new Set(['root']));
    }
  }, [currentMatchPath, searchTerm]);

  // Helper to highlight text
  const highlightText = (text: string) => {
    if (!searchTerm.trim()) return text;

    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + searchTerm.length);
    const after = text.substring(index + searchTerm.length);

    return (
      <>
        {before}
        <Highlight>{match}</Highlight>
        {highlightText(after)}
      </>
    );
  };

  const togglePath = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleBreadcrumbClick = (segmentPath: string) => {
    // Expand all parent paths up to and including the clicked segment
    const newExpandedPaths = new Set<string>();
    const parts = segmentPath.split('.');

    for (let i = 0; i < parts.length; i++) {
      const parentPath = parts.slice(0, i + 1).join('.');
      newExpandedPaths.add(parentPath);
    }

    setExpandedPaths(newExpandedPaths);
  };

  const isExpanded = (path: string) => expandedPaths.has(path);

  const handleValueClick = (path: string) => {
    setSelectedPath(path);
  };

  const renderValue = (value: any, key: string | number, path: string, indent: number, isLast: boolean): JSX.Element[] => {
    const currentPath = `${path}.${key}`;
    const elements: JSX.Element[] = [];
    const isCurrentMatch = currentPath === currentMatchPath;
    const isSelected = currentPath === selectedPath;

    if (value === null) {
      elements.push(
        <Line key={currentPath} $indent={indent} ref={isCurrentMatch ? currentMatchRef : undefined}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          {typeof key === 'string' && <Key>{highlightText(key)}:</Key>}
          <NullValue $isSelected={isSelected} onClick={() => handleValueClick(currentPath)}>null</NullValue>
          {!isLast && <Comma>,</Comma>}
        </Line>
      );
    } else if (Array.isArray(value)) {
      const expanded = isExpanded(currentPath);
      const hasItems = value.length > 0;

      elements.push(
        <Line key={currentPath} $indent={indent} ref={isCurrentMatch ? currentMatchRef : undefined}>
          <ToggleButton onClick={() => hasItems && togglePath(currentPath)}>
            {hasItems ? (expanded ? '▼' : '▶') : ' '}
          </ToggleButton>
          {typeof key === 'string' && <Key>{highlightText(key)}:</Key>}
          <Bracket>[</Bracket>
          {!expanded && hasItems && <Expandable>{value.length} items</Expandable>}
          {!hasItems && <Bracket>]</Bracket>}
          {!expanded && !isLast && <Comma>,</Comma>}
        </Line>
      );

      if (expanded && hasItems) {
        value.forEach((item, index) => {
          elements.push(...renderValue(item, index, currentPath, indent + 1, index === value.length - 1));
        });
        elements.push(
          <Line key={`${currentPath}-close`} $indent={indent}>
            <ToggleButton style={{ visibility: 'hidden' }} />
            <Bracket>]</Bracket>
            {!isLast && <Comma>,</Comma>}
          </Line>
        );
      }
    } else if (typeof value === 'object') {
      const expanded = isExpanded(currentPath);
      const keys = Object.keys(value);
      const hasKeys = keys.length > 0;

      elements.push(
        <Line key={currentPath} $indent={indent} ref={isCurrentMatch ? currentMatchRef : undefined}>
          <ToggleButton onClick={() => hasKeys && togglePath(currentPath)}>
            {hasKeys ? (expanded ? '▼' : '▶') : ' '}
          </ToggleButton>
          {typeof key === 'string' && <Key>{highlightText(key)}:</Key>}
          <Bracket>{'{'}</Bracket>
          {!expanded && hasKeys && <Expandable>{keys.length} keys</Expandable>}
          {!hasKeys && <Bracket>{'}'}</Bracket>}
          {!expanded && !isLast && <Comma>,</Comma>}
        </Line>
      );

      if (expanded && hasKeys) {
        keys.forEach((objKey, index) => {
          elements.push(...renderValue(value[objKey], objKey, currentPath, indent + 1, index === keys.length - 1));
        });
        elements.push(
          <Line key={`${currentPath}-close`} $indent={indent}>
            <ToggleButton style={{ visibility: 'hidden' }} />
            <Bracket>{'}'}</Bracket>
            {!isLast && <Comma>,</Comma>}
          </Line>
        );
      }
    } else if (typeof value === 'string') {
      elements.push(
        <Line key={currentPath} $indent={indent} ref={isCurrentMatch ? currentMatchRef : undefined}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          {typeof key === 'string' && <Key>{highlightText(key)}:</Key>}
          <StringValue $isSelected={isSelected} onClick={() => handleValueClick(currentPath)}>"{highlightText(value)}"</StringValue>
          {!isLast && <Comma>,</Comma>}
        </Line>
      );
    } else if (typeof value === 'number') {
      elements.push(
        <Line key={currentPath} $indent={indent} ref={isCurrentMatch ? currentMatchRef : undefined}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          {typeof key === 'string' && <Key>{highlightText(key)}:</Key>}
          <NumberValue $isSelected={isSelected} onClick={() => handleValueClick(currentPath)}>{highlightText(String(value))}</NumberValue>
          {!isLast && <Comma>,</Comma>}
        </Line>
      );
    } else if (typeof value === 'boolean') {
      elements.push(
        <Line key={currentPath} $indent={indent} ref={isCurrentMatch ? currentMatchRef : undefined}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          {typeof key === 'string' && <Key>{highlightText(key)}:</Key>}
          <BooleanValue $isSelected={isSelected} onClick={() => handleValueClick(currentPath)}>{highlightText(value.toString())}</BooleanValue>
          {!isLast && <Comma>,</Comma>}
        </Line>
      );
    }

    return elements;
  };

  const renderJson = (obj: any): JSX.Element[] => {
    const isRootSelected = selectedPath === 'root';

    if (obj === null) {
      return [
        <Line key="root" $indent={0}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          <NullValue $isSelected={isRootSelected} onClick={() => handleValueClick('root')}>null</NullValue>
        </Line>
      ];
    }

    if (Array.isArray(obj)) {
      const expanded = isExpanded('root');
      const hasItems = obj.length > 0;
      const elements: JSX.Element[] = [];

      elements.push(
        <Line key="root" $indent={0}>
          <ToggleButton onClick={() => hasItems && togglePath('root')}>
            {hasItems ? (expanded ? '▼' : '▶') : ' '}
          </ToggleButton>
          <Bracket>[</Bracket>
          {!expanded && hasItems && <Expandable>{obj.length} items</Expandable>}
          {!hasItems && <Bracket>]</Bracket>}
        </Line>
      );

      if (expanded && hasItems) {
        obj.forEach((item, index) => {
          elements.push(...renderValue(item, index, 'root', 1, index === obj.length - 1));
        });
        elements.push(
          <Line key="root-close" $indent={0}>
            <ToggleButton style={{ visibility: 'hidden' }} />
            <Bracket>]</Bracket>
          </Line>
        );
      }

      return elements;
    }

    if (typeof obj === 'object') {
      const expanded = isExpanded('root');
      const keys = Object.keys(obj);
      const hasKeys = keys.length > 0;
      const elements: JSX.Element[] = [];

      elements.push(
        <Line key="root" $indent={0}>
          <ToggleButton onClick={() => hasKeys && togglePath('root')}>
            {hasKeys ? (expanded ? '▼' : '▶') : ' '}
          </ToggleButton>
          <Bracket>{'{'}</Bracket>
          {!expanded && hasKeys && <Expandable>{keys.length} keys</Expandable>}
          {!hasKeys && <Bracket>{'}'}</Bracket>}
        </Line>
      );

      if (expanded && hasKeys) {
        keys.forEach((key, index) => {
          elements.push(...renderValue(obj[key], key, 'root', 1, index === keys.length - 1));
        });
        elements.push(
          <Line key="root-close" $indent={0}>
            <ToggleButton style={{ visibility: 'hidden' }} />
            <Bracket>{'}'}</Bracket>
          </Line>
        );
      }

      return elements;
    }

    // Primitive at root level
    if (typeof obj === 'string') {
      return [
        <Line key="root" $indent={0}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          <StringValue $isSelected={isRootSelected} onClick={() => handleValueClick('root')}>"{obj}"</StringValue>
        </Line>
      ];
    }

    if (typeof obj === 'number') {
      return [
        <Line key="root" $indent={0}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          <NumberValue $isSelected={isRootSelected} onClick={() => handleValueClick('root')}>{obj}</NumberValue>
        </Line>
      ];
    }

    if (typeof obj === 'boolean') {
      return [
        <Line key="root" $indent={0}>
          <ToggleButton style={{ visibility: 'hidden' }} />
          <BooleanValue $isSelected={isRootSelected} onClick={() => handleValueClick('root')}>{obj.toString()}</BooleanValue>
        </Line>
      ];
    }

    return [
      <Line key="root" $indent={0}>
        <ToggleButton style={{ visibility: 'hidden' }} />
        <EmptyPlaceholder>Unknown type</EmptyPlaceholder>
      </Line>
    ];
  };

  if (parseError) {
    return (
      <Wrapper>
        <Container>
          <ErrorMessage>{parseError}</ErrorMessage>
        </Container>
      </Wrapper>
    );
  }

  // Determine which path to show in breadcrumb: current match or selected path
  const displayPath = currentMatchPath || selectedPath;

  return (
    <Wrapper>
      {showBreadcrumb && displayPath && (
        <JsonBreadcrumb path={displayPath} onSegmentClick={handleBreadcrumbClick} />
      )}
      <Container>{renderJson(parsedData)}</Container>
    </Wrapper>
  );
};

const NavigationButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const MatchCounter = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

// Separate search bar component that can be used externally
interface JsonSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  data: string | object;
  currentMatchIndex?: number;
  onMatchIndexChange?: (index: number) => void;
}

export const JsonSearchBar = ({
  searchTerm,
  onSearchChange,
  data,
  currentMatchIndex = 0,
  onMatchIndexChange
}: JsonSearchBarProps) => {
  let parsedData: any;

  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = null;
    }
  } else {
    parsedData = data;
  }

  // Calculate match count
  const totalMatches = useMemo(() => {
    if (!searchTerm.trim() || !parsedData) return 0;

    let matchCount = 0;
    const searchLower = searchTerm.toLowerCase();

    const searchInValue = (value: any): void => {
      if (value === null || value === undefined) {
        if ('null'.includes(searchLower) || 'undefined'.includes(searchLower)) {
          matchCount++;
        }
        return;
      }

      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) {
          searchInValue(value[index]);
        }
      } else if (typeof value === 'object') {
        const keys = Object.keys(value);
        for (const key of keys) {
          if (key.toLowerCase().includes(searchLower)) {
            matchCount++;
          }
          searchInValue(value[key]);
        }
      } else {
        const strValue = String(value).toLowerCase();
        if (strValue.includes(searchLower)) {
          matchCount++;
        }
      }
    };

    searchInValue(parsedData);
    return matchCount;
  }, [parsedData, searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!onMatchIndexChange || totalMatches === 0) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        // Previous match (Shift + Enter)
        handlePrevious();
      } else {
        // Next match (Enter)
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (!onMatchIndexChange || totalMatches === 0) return;
    const nextIndex = (currentMatchIndex + 1) % totalMatches;
    onMatchIndexChange(nextIndex);
  };

  const handlePrevious = () => {
    if (!onMatchIndexChange || totalMatches === 0) return;
    const prevIndex = currentMatchIndex === 0 ? totalMatches - 1 : currentMatchIndex - 1;
    onMatchIndexChange(prevIndex);
  };

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Search in JSON... (Enter to navigate)"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {searchTerm && totalMatches > 0 && onMatchIndexChange && (
        <SearchControls>
          <MatchCounter>
            {currentMatchIndex + 1} of {totalMatches}
          </MatchCounter>
          <NavigationButton onClick={handlePrevious} disabled={totalMatches === 0}>
            ↑ Prev
          </NavigationButton>
          <NavigationButton onClick={handleNext} disabled={totalMatches === 0}>
            Next ↓
          </NavigationButton>
        </SearchControls>
      )}
      {searchTerm && totalMatches > 0 && !onMatchIndexChange && (
        <SearchStats>{totalMatches} matches found</SearchStats>
      )}
      {searchTerm && totalMatches === 0 && searchTerm.trim() && (
        <SearchStats>No matches found</SearchStats>
      )}
    </SearchContainer>
  );
};
