import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { mcpClient } from '../services/mcpClient';
import { SetupIllustration } from './SetupIllustration';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: scale(0.95) translateY(20px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
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
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ToggleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ToggleInfo = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ToggleDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  margin-left: ${({ theme }) => theme.spacing.md};
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  transition: ${({ theme }) => theme.transitions.normal};

  &:before {
    content: '';
    position: absolute;
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: ${({ theme }) => theme.transitions.normal};
  }
`;

const StatusSection = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusValue = styled.div<{ $status?: 'connected' | 'disconnected' | 'checking' }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $status }) => {
    if ($status === 'connected') return theme.colors.statusConnected;
    if ($status === 'disconnected') return theme.colors.statusDisconnected;
    if ($status === 'checking') return theme.colors.statusChecking;
    return theme.colors.text;
  }};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ServerUrlRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ServerUrl = styled.code`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text};
  overflow-x: auto;
  white-space: nowrap;
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TestButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const RequirementsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RequirementsHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const RequirementsList = styled.ul`
  margin: ${({ theme }) => theme.spacing.md} 0 0 0;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  list-style: none;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.sm} ${({ theme }) => theme.borderRadius.sm};
`;

const RequirementItem = styled.li`
  position: relative;
  padding-left: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  &:before {
    content: '•';
    position: absolute;
    left: 0;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const FooterButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #ffffff;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { cursorIntegrationEnabled, toggleIntegration } = useSettingsStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [requirementsExpanded, setRequirementsExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen && cursorIntegrationEnabled) {
      // Check connection status when modal opens
      checkConnection();

      // Update status every 10 seconds while modal is open
      const interval = setInterval(() => {
        checkConnection();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isOpen, cursorIntegrationEnabled]);

  const checkConnection = async () => {
    const connected = await mcpClient.checkHealth();
    setIsConnected(connected);
    setLastChecked(new Date());
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await checkConnection();
    setTimeout(() => {
      setIsTesting(false);
    }, 1000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('http://localhost:3100/mcp');
    setUrlCopied(true);
    setTimeout(() => {
      setUrlCopied(false);
    }, 2000);
  };

  const handleToggle = () => {
    toggleIntegration();
    if (!cursorIntegrationEnabled) {
      // Just enabled, check connection
      setTimeout(() => {
        checkConnection();
      }, 500);
    }
  };

  const formatLastChecked = () => {
    if (!lastChecked) return 'Never';
    const seconds = Math.floor((Date.now() - lastChecked.getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''} ago`;
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Cursor Integration Settings</Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        <SetupIllustration />

        <ToggleSection>
          <ToggleInfo>
            <ToggleTitle>Enable Cursor Integration</ToggleTitle>
            <ToggleDescription>
              Allow sending API calls to Cursor IDE for AI-powered analysis
            </ToggleDescription>
          </ToggleInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={cursorIntegrationEnabled}
              onChange={handleToggle}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </ToggleSection>

        {cursorIntegrationEnabled && (
          <StatusSection>
            <StatusRow>
              <StatusLabel>Connection Status</StatusLabel>
              <StatusValue $status={isTesting ? 'checking' : isConnected ? 'connected' : 'disconnected'}>
                {isTesting ? 'Checking...' : isConnected ? '✓ Connected' : '✗ Disconnected'}
              </StatusValue>
            </StatusRow>

            <StatusRow>
              <StatusLabel>MCP Server URL</StatusLabel>
            </StatusRow>
            <ServerUrlRow>
              <ServerUrl>http://localhost:3100/mcp</ServerUrl>
              <IconButton onClick={handleCopyUrl} title="Copy URL">
                {urlCopied ? <Check /> : <Copy />}
              </IconButton>
            </ServerUrlRow>

            <StatusRow style={{ marginTop: '1rem' }}>
              <StatusLabel>Last Checked</StatusLabel>
              <StatusValue>{formatLastChecked()}</StatusValue>
            </StatusRow>

            <TestButton onClick={handleTestConnection} disabled={isTesting}>
              <RefreshCw style={{ animation: isTesting ? 'spin 1s linear infinite' : 'none' }} />
              {isTesting ? 'Testing Connection...' : 'Test Connection'}
            </TestButton>
          </StatusSection>
        )}

        <RequirementsSection>
          <RequirementsHeader onClick={() => setRequirementsExpanded(!requirementsExpanded)}>
            <span>Requirements</span>
            {requirementsExpanded ? <ChevronUp /> : <ChevronDown />}
          </RequirementsHeader>
          {requirementsExpanded && (
            <RequirementsList>
              <RequirementItem>
                MCP server must be running on port 3100 (run <code>pnpm run start:http</code> in the MCP directory)
              </RequirementItem>
              <RequirementItem>
                HAR file must be loaded in the viewer
              </RequirementItem>
              <RequirementItem>
                Cursor IDE must have the MCP server configured in settings
              </RequirementItem>
              <RequirementItem>
                Browser and MCP server must be on the same machine (localhost)
              </RequirementItem>
            </RequirementsList>
          )}
        </RequirementsSection>

        <FooterButton onClick={onClose}>Close</FooterButton>

        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </Modal>
    </Overlay>
  );
};
