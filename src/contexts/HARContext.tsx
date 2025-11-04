import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { HAR, Entry, EntryWithMetadata } from '@types';

interface HARContextType {
  har: HAR | null;
  entries: EntryWithMetadata[];
  selectedEntry: EntryWithMetadata | null;
  fileName: string | null;
  setHAR: (har: HAR, fileName: string) => void;
  selectEntry: (entry: EntryWithMetadata | null) => void;
  clearHAR: () => void;
}

const HARContext = createContext<HARContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useHAR = () => {
  const context = useContext(HARContext);
  if (!context) {
    throw new Error('useHAR must be used within a HARProvider');
  }
  return context;
};

interface HARProviderProps {
  children: ReactNode;
}

export const HARProvider = ({ children }: HARProviderProps) => {
  const [har, setHARState] = useState<HAR | null>(null);
  const [entries, setEntries] = useState<EntryWithMetadata[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<EntryWithMetadata | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const setHAR = (newHAR: HAR, name: string) => {
    setHARState(newHAR);
    setFileName(name);

    // Process entries with metadata
    const processedEntries: EntryWithMetadata[] = newHAR.log.entries.map((entry, index) => {
      const url = new URL(entry.request.url);
      // Show full pathname + query string for API endpoints
      const pathAndQuery = url.pathname + url.search;
      return {
        ...entry,
        resourceType: getResourceType(entry),
        domain: url.hostname,
        fileName: pathAndQuery || '/',
        index,
      };
    });

    setEntries(processedEntries);
    setSelectedEntry(null);
  };

  const selectEntry = (entry: EntryWithMetadata | null) => {
    setSelectedEntry(entry);
  };

  const clearHAR = () => {
    setHARState(null);
    setEntries([]);
    setSelectedEntry(null);
    setFileName(null);
  };

  return (
    <HARContext.Provider
      value={{
        har,
        entries,
        selectedEntry,
        fileName,
        setHAR,
        selectEntry,
        clearHAR,
      }}
    >
      {children}
    </HARContext.Provider>
  );
};

// Helper function to determine resource type
function getResourceType(entry: Entry): EntryWithMetadata['resourceType'] {
  const mimeType = entry.response.content.mimeType.toLowerCase();
  const url = entry.request.url.toLowerCase();

  if (mimeType.includes('html')) return 'html';
  if (mimeType.includes('css')) return 'css';
  if (mimeType.includes('javascript') || mimeType.includes('ecmascript')) return 'javascript';
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'xhr';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('font/') || mimeType.includes('woff') || mimeType.includes('ttf')) return 'font';
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'media';
  if (url.includes('manifest.json') || mimeType.includes('manifest')) return 'manifest';
  if (url.includes('websocket') || entry.response.status === 101) return 'websocket';
  if (mimeType.includes('fetch')) return 'fetch';

  return 'other';
}
