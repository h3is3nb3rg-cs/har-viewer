import styled from 'styled-components';
import { Server, MousePointer, Send, ChevronRight } from 'lucide-react';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => `${theme.spacing.lg} 0`};
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StepNumber = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const IconContainer = styled.div`
  position: relative;
`;

const StepTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StepDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const CodeSnippet = styled.code`
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text};
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Arrow = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`;

export const SetupIllustration = () => {
  return (
    <Container>
      <StepsContainer>
        <Step>
          <IconContainer>
            <IconWrapper>
              <Server />
            </IconWrapper>
            <StepNumber>1</StepNumber>
          </IconContainer>
          <div>
            <StepTitle>Start MCP Server</StepTitle>
            <StepDescription>
              Run the MCP server locally to enable communication
            </StepDescription>
            <CodeSnippet>pnpm run start:http</CodeSnippet>
          </div>
        </Step>

        <Arrow>
          <ChevronRight />
        </Arrow>

        <Step>
          <IconContainer>
            <IconWrapper>
              <MousePointer />
            </IconWrapper>
            <StepNumber>2</StepNumber>
          </IconContainer>
          <div>
            <StepTitle>Select API Call</StepTitle>
            <StepDescription>
              Load a HAR file and click on any API request you want to analyze
            </StepDescription>
          </div>
        </Step>

        <Arrow>
          <ChevronRight />
        </Arrow>

        <Step>
          <IconContainer>
            <IconWrapper>
              <Send />
            </IconWrapper>
            <StepNumber>3</StepNumber>
          </IconContainer>
          <div>
            <StepTitle>Send to Cursor</StepTitle>
            <StepDescription>
              Click the "Send to Cursor" button to analyze the API in your IDE
            </StepDescription>
          </div>
        </Step>
      </StepsContainer>
    </Container>
  );
};
