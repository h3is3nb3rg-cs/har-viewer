import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Settings } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { mcpClient } from '../services/mcpClient';
import { SettingsModal } from './SettingsModal';
import { Tooltip } from './shared/Tooltip';

const Button = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    transform: scale(1.05);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatusBadge = styled.div<{ $status: 'connected' | 'disconnected' | 'disabled' | 'checking' }>`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 2px solid ${({ theme }) => theme.colors.background};
  background-color: ${({ theme, $status }) => {
    if ($status === 'connected') return theme.colors.statusConnected;
    if ($status === 'disconnected') return theme.colors.statusDisconnected;
    if ($status === 'checking') return theme.colors.statusChecking;
    return theme.colors.statusDisabled;
  }};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  animation: ${({ $status }) => $status === 'checking' ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const SettingsButton = () => {
  const { cursorIntegrationEnabled } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (cursorIntegrationEnabled) {
      // Check connection status periodically
      const checkConnection = async () => {
        setIsChecking(true);
        const connected = await mcpClient.checkHealth();
        setIsConnected(connected);
        setIsChecking(false);
      };

      // Initial check
      checkConnection();

      // Check every 10 seconds
      const interval = setInterval(checkConnection, 10000);

      return () => clearInterval(interval);
    } else {
      // Integration disabled
      setIsConnected(false);
      setIsChecking(false);
    }
  }, [cursorIntegrationEnabled]);

  const getStatusBadge = (): 'connected' | 'disconnected' | 'disabled' | 'checking' => {
    if (!cursorIntegrationEnabled) return 'disabled';
    if (isChecking) return 'checking';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  const getTooltipText = (): string => {
    if (!cursorIntegrationEnabled) {
      return 'Cursor Integration: Disabled';
    }
    if (isChecking) {
      return 'Cursor Integration: Checking...';
    }
    if (isConnected) {
      return 'Cursor Integration: Connected';
    }
    return 'Cursor Integration: Disconnected (Server not reachable)';
  };

  return (
    <>
      <Tooltip content={getTooltipText()} position="bottom">
        <Button onClick={() => setIsModalOpen(true)} aria-label="Open Settings">
          <Settings />
          <StatusBadge $status={getStatusBadge()} />
        </Button>
      </Tooltip>
      <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
