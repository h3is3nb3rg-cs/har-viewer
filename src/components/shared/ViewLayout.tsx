import { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';

/**
 * Shared layout components used across TableView and WaterfallChart
 * to maintain consistent split-panel layout behavior
 */

/**
 * Main wrapper for split-panel layout (when entry is selected)
 */
const Wrapper = styled.div<{ $isDragging?: boolean }>`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  user-select: ${({ $isDragging }) => ($isDragging ? 'none' : 'auto')};
`;

/**
 * Left panel showing the list of entries
 */
const ListPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

/**
 * Right panel showing entry details
 */
const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

/**
 * Draggable divider between the two panels
 */
const DragHandle = styled.div<{ $isDragging: boolean }>`
  width: 6px;
  cursor: col-resize;
  background-color: ${({ $isDragging, theme }) =>
    $isDragging ? theme.colors.primary : 'transparent'};
  border-radius: 3px;
  transition: background-color 0.15s ease;
  flex-shrink: 0;
  align-self: stretch;
  margin: 0 2px;
  outline: none;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Empty state message for details panel
 */
export const EmptyDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

/**
 * Full-width container for list view (when no entry is selected)
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

interface ResizableSplitPanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const ResizableSplitPanel = ({ leftPanel, rightPanel }: ResizableSplitPanelProps) => {
  const [leftWidthPercent, setLeftWidthPercent] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const newPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(70, Math.max(15, newPercent));
      setLeftWidthPercent(clamped);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const handleDragKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setLeftWidthPercent((prev) => Math.max(15, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setLeftWidthPercent((prev) => Math.min(70, prev + 1));
      }
    },
    []
  );

  return (
    <Wrapper ref={wrapperRef} $isDragging={isDragging}>
      <ListPanel style={{ flex: `0 0 ${leftWidthPercent}%` }}>
        {leftPanel}
      </ListPanel>
      <DragHandle
        onMouseDown={startDragging}
        onKeyDown={handleDragKeyDown}
        tabIndex={0}
        $isDragging={isDragging}
      />
      <DetailsPanel>
        {rightPanel}
      </DetailsPanel>
    </Wrapper>
  );
};
