/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import App from './App.tsx'
import { HARProvider } from '@contexts/HARContext'
import { GlobalStyles } from '@styles/GlobalStyles'
import { useThemeStore } from './stores/themeStore'

function AppWrapper() {
  const theme = useThemeStore((state) => state.theme);

  return (
    <ThemeProvider theme={theme}>
      <HARProvider>
        <GlobalStyles />
        <App />
      </HARProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
