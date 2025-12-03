import { useState, useRef, useEffect, type ReactNode } from 'react';
import styled from 'styled-components';

interface TooltipProps {
  content: string;
  children: ReactNode;
  delay?: number; // Delay before showing tooltip (ms)
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const TooltipContent = styled.div<{ $show: boolean; $position: string }>`
  position: absolute;
  background-color: #1a1a1a;
  color: #ffffff;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
  opacity: ${({ $show }) => ($show ? '1' : '0')};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transition: opacity ${({ theme }) => theme.transitions.normal},
              visibility ${({ theme }) => theme.transitions.normal};

  /* Position-specific styles */
  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        `;
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
        `;
      case 'left':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 8px;
        `;
      case 'right':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 8px;
        `;
      default:
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        `;
    }
  }}

  /* Arrow */
  &::after {
    content: '';
    position: absolute;
    border: 4px solid transparent;

    ${({ $position }) => {
      switch ($position) {
        case 'top':
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: #1a1a1a;
          `;
        case 'bottom':
          return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: #1a1a1a;
          `;
        case 'left':
          return `
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-left-color: #1a1a1a;
          `;
        case 'right':
          return `
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-right-color: #1a1a1a;
          `;
        default:
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: #1a1a1a;
          `;
      }
    }}
  }
`;

export const Tooltip = ({ content, children, delay = 300, position = 'top' }: TooltipProps) => {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShow(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <TooltipContent $show={show} $position={position}>
        {content}
      </TooltipContent>
    </TooltipContainer>
  );
};
