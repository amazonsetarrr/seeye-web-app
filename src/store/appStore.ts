import { create } from 'zustand';
import type { View } from '../components/Sidebar';
import type { UploadedFile } from '../features/file-management/types';
import type { FieldMapping } from '../features/mapping/types';
import type { ReconciliationResult } from '../features/matching/types';
import type { NormalizedDataset } from '../features/normalization/types';

interface AppState {
  // State
  currentView: View;
  files: UploadedFile[];
  mappings: FieldMapping[];
  normalizedData: NormalizedDataset | null;
  results: ReconciliationResult | null;
  strategy: 'exact' | 'fuzzy';

  // Actions
  setCurrentView: (view: View) => void;
  addFiles: (files: UploadedFile[]) => void;
  removeFile: (id: string) => void;
  swapFiles: () => void;
  setMappings: (mappings: FieldMapping[]) => void;
  setNormalizedData: (data: NormalizedDataset | null) => void;
  setResults: (results: ReconciliationResult | null) => void;
  setStrategy: (strategy: 'exact' | 'fuzzy') => void;

  // Computed values
  getStepsStatus: () => {
    datasource: boolean;
    mapping: boolean;
    normalization: boolean;
    reconciliation: boolean;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentView: 'home',
  files: [],
  mappings: [],
  normalizedData: null,
  results: null,
  strategy: 'fuzzy',

  // Actions
  setCurrentView: (view) => set({ currentView: view }),

  addFiles: (newFiles) => set((state) => ({
    files: [...state.files, ...newFiles]
  })),

  removeFile: (id) => set((state) => ({
    files: state.files.filter((f) => f.id !== id)
  })),

  swapFiles: () => set((state) => {
    if (state.files.length < 2) return state;
    const newFiles = [...state.files];
    [newFiles[0], newFiles[1]] = [newFiles[1], newFiles[0]];
    return { files: newFiles };
  }),

  setMappings: (mappings) => set({ mappings }),

  setNormalizedData: (data) => set({ normalizedData: data }),

  setResults: (results) => set({ results }),

  setStrategy: (strategy) => set({ strategy }),

  getStepsStatus: () => {
    const state = get();
    return {
      datasource: state.files.length >= 2,
      mapping: state.mappings.some(m => m.isKey),
      normalization: !!state.normalizedData,
      reconciliation: !!state.results,
    };
  },
}));
