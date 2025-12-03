import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mcpClient } from '../services/mcpClient';

interface SettingsState {
  cursorIntegrationEnabled: boolean;
  enableIntegration: () => void;
  disableIntegration: () => void;
  toggleIntegration: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      cursorIntegrationEnabled: false,

      enableIntegration: () => {
        // Start health checks when integration is enabled
        mcpClient.startHealthCheck(10000); // Check every 10 seconds
        set({ cursorIntegrationEnabled: true });
      },

      disableIntegration: () => {
        // Stop health checks when integration is disabled
        mcpClient.stopHealthCheck();
        set({ cursorIntegrationEnabled: false });
      },

      toggleIntegration: () => {
        const { cursorIntegrationEnabled, enableIntegration, disableIntegration } = get();
        if (cursorIntegrationEnabled) {
          disableIntegration();
        } else {
          enableIntegration();
        }
      },
    }),
    {
      name: 'cursor-integration-storage', // localStorage key
      partialize: (state: SettingsState) => ({
        cursorIntegrationEnabled: state.cursorIntegrationEnabled
      }), // Only persist the enabled flag
      onRehydrateStorage: () => (state: SettingsState | undefined) => {
        // Restore health checks if integration was enabled before page refresh
        if (state?.cursorIntegrationEnabled) {
          mcpClient.startHealthCheck(10000);
        }
      },
    }
  )
);
