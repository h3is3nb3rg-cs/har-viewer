import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomFilter } from '../types/filters';
import { DEFAULT_CUSTOM_FILTERS } from '../types/filters';

interface CustomFiltersState {
  filters: CustomFilter[];
  initialized: boolean;
  addFilter: (filter: Omit<CustomFilter, 'id' | 'createdAt'>) => void;
  updateFilter: (id: string, updates: Partial<Omit<CustomFilter, 'id' | 'createdAt'>>) => void;
  deleteFilter: (id: string) => void;
  reorderFilters: (startIndex: number, endIndex: number) => void;
  getFilterById: (id: string) => CustomFilter | undefined;
}

export const useCustomFiltersStore = create<CustomFiltersState>()(
  persist(
    (set, get) => ({
      filters: [],
      initialized: false,

      addFilter: (filter) =>
        set((state) => ({
          filters: [
            ...state.filters,
            {
              ...filter,
              id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: Date.now(),
            },
          ],
        })),

      updateFilter: (id, updates) =>
        set((state) => ({
          filters: state.filters.map((filter) =>
            filter.id === id ? { ...filter, ...updates } : filter
          ),
        })),

      deleteFilter: (id) =>
        set((state) => ({
          filters: state.filters.filter((filter) => filter.id !== id),
        })),

      reorderFilters: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.filters);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { filters: result };
        }),

      getFilterById: (id) => {
        return get().filters.find((filter) => filter.id === id);
      },
    }),
    {
      name: 'custom-filters-storage', // localStorage key
      onRehydrateStorage: () => (state) => {
        // Initialize with default filters on first load
        if (state && !state.initialized && state.filters.length === 0) {
          state.filters = [...DEFAULT_CUSTOM_FILTERS];
          state.initialized = true;
        }
      },
    }
  )
);
