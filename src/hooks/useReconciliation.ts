import { useState, useCallback } from 'react';
import type { UploadedFile } from '../features/file-management/types';
import type { FieldMapping } from '../features/mapping/types';
import type { ReconciliationResult } from '../features/matching/types';
import type { NormalizedDataset } from '../features/normalization/types';
import { reconcileData } from '../features/matching/engine';
import { JobStore } from '../utils/store';

export interface ReconciliationState {
  files: UploadedFile[];
  mappings: FieldMapping[];
  normalizedData: NormalizedDataset | null;
  results: ReconciliationResult | null;
  strategy: 'exact' | 'fuzzy';
}

export interface ReconciliationActions {
  handleFilesUploaded: (newFiles: UploadedFile[]) => void;
  handleRemoveFile: (id: string) => void;
  handleSwapFiles: () => void;
  setMappings: (mappings: FieldMapping[]) => void;
  setNormalizedData: (data: NormalizedDataset | null) => void;
  setStrategy: (strategy: 'exact' | 'fuzzy') => void;
  runReconciliation: () => ReconciliationResult | null;
  getStepsStatus: () => {
    datasource: boolean;
    mapping: boolean;
    normalization: boolean;
    reconciliation: boolean;
  };
}

export function useReconciliation(): ReconciliationState & ReconciliationActions {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [normalizedData, setNormalizedData] = useState<NormalizedDataset | null>(null);
  const [results, setResults] = useState<ReconciliationResult | null>(null);
  const [strategy, setStrategy] = useState<'exact' | 'fuzzy'>('fuzzy');

  const handleFilesUploaded = useCallback((newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleSwapFiles = useCallback(() => {
    setFiles((prev) => {
      if (prev.length < 2) return prev;
      const newFiles = [...prev];
      const temp = newFiles[0];
      newFiles[0] = newFiles[1];
      newFiles[1] = temp;
      return newFiles;
    });
  }, []);

  const runReconciliation = useCallback(() => {
    if (files.length < 2) return null;

    const result = reconcileData(files[0], files[1], {
      mappings,
      fuzzyThreshold: 0.8,
      strategy,
    });

    setResults(result);

    // Save job to history
    JobStore.addJob({
      name: `${files[0].name} vs ${files[1].name}`,
      status: result.summary.conflicts > 0 ? 'Review Needed' : 'Completed',
      items: result.summary.total,
    });

    return result;
  }, [files, mappings, strategy]);

  const getStepsStatus = useCallback(() => ({
    datasource: files.length >= 2,
    mapping: mappings.some(m => m.isKey),
    normalization: !!normalizedData,
    reconciliation: !!results,
  }), [files, mappings, normalizedData, results]);

  return {
    files,
    mappings,
    normalizedData,
    results,
    strategy,
    handleFilesUploaded,
    handleRemoveFile,
    handleSwapFiles,
    setMappings,
    setNormalizedData,
    setStrategy,
    runReconciliation,
    getStepsStatus,
  };
}
