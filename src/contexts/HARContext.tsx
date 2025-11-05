import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { HAR, EntryWithMetadata } from '@types';
import { getResourceType } from '@utils/resourceTypeDetector';

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

  const setHAR = useCallback((newHAR: HAR, name: string) => {
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
  }, []);

  const selectEntry = useCallback((entry: EntryWithMetadata | null) => {
    setSelectedEntry(entry);
  }, []);

  const clearHAR = useCallback(() => {
    setHARState(null);
    setEntries([]);
    setSelectedEntry(null);
    setFileName(null);
  }, []);

  const value = useMemo(
    () => ({
      har,
      entries,
      selectedEntry,
      fileName,
      setHAR,
      selectEntry,
      clearHAR,
    }),
    [har, entries, selectedEntry, fileName, setHAR, selectEntry, clearHAR]
  );

  return <HARContext.Provider value={value}>{children}</HARContext.Provider>;
};
