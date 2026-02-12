import { useCallback } from 'react';
import type { EntryWithMetadata } from '@types';

interface UseListKeyboardNavOptions {
  filteredEntries: EntryWithMetadata[];
  selectedEntry: EntryWithMetadata | null;
  selectEntry: (entry: EntryWithMetadata | null) => void;
}

export function useListKeyboardNav({
  filteredEntries,
  selectedEntry,
  selectEntry,
}: UseListKeyboardNavOptions) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (filteredEntries.length === 0) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!selectedEntry) {
            selectEntry(filteredEntries[0]);
            return;
          }
          const currentIdx = filteredEntries.findIndex(
            (entry) => entry.index === selectedEntry.index
          );
          if (currentIdx === -1) {
            selectEntry(filteredEntries[0]);
          } else if (currentIdx < filteredEntries.length - 1) {
            selectEntry(filteredEntries[currentIdx + 1]);
          }
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          if (!selectedEntry) {
            selectEntry(filteredEntries[0]);
            return;
          }
          const currentIdx = filteredEntries.findIndex(
            (entry) => entry.index === selectedEntry.index
          );
          if (currentIdx === -1) {
            selectEntry(filteredEntries[0]);
          } else if (currentIdx > 0) {
            selectEntry(filteredEntries[currentIdx - 1]);
          }
          break;
        }

        case 'Escape': {
          if (selectedEntry) {
            selectEntry(null);
          }
          break;
        }
      }
    },
    [filteredEntries, selectedEntry, selectEntry]
  );

  return { handleKeyDown };
}
