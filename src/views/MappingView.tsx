import { ArrowRight, Play } from 'lucide-react';
import { MappingBoard } from '../features/mapping/MappingBoard';
import type { UploadedFile } from '../features/file-management/types';
import type { FieldMapping } from '../features/mapping/types';

interface MappingViewProps {
  sourceFile?: UploadedFile;
  targetFile?: UploadedFile;
  strategy: 'exact' | 'fuzzy';
  onMappingChange: (mappings: FieldMapping[]) => void;
  onStrategyChange: (strategy: 'exact' | 'fuzzy') => void;
  onNext: () => void;
  onRunReconciliation: () => void;
  canProceed: boolean;
}

export function MappingView({
  sourceFile,
  targetFile,
  strategy,
  onMappingChange,
  onStrategyChange,
  onNext,
  onRunReconciliation,
  canProceed,
}: MappingViewProps) {
  if (!sourceFile || !targetFile) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please upload at least two files to proceed with mapping.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Map Fields</h2>
        <p className="text-[var(--color-text-secondary)]">
          Map columns from <strong>{sourceFile.name}</strong> to <strong>{targetFile.name}</strong> to define how records should be compared.
        </p>
      </div>

      <MappingBoard
        sourceFile={sourceFile}
        targetFile={targetFile}
        onMappingChange={onMappingChange}
      />

      {canProceed && (
        <div className="flex flex-col items-end gap-4 mt-8">
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-600 pl-2">Match Strategy:</span>
            <div className="flex bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => onStrategyChange('exact')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  strategy === 'exact'
                    ? 'bg-white text-[var(--color-primary)] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Exact Match
              </button>
              <button
                onClick={() => onStrategyChange('fuzzy')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  strategy === 'fuzzy'
                    ? 'bg-white text-[var(--color-primary)] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Fuzzy Match
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onNext}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
            >
              Next: Normalize Data
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={onRunReconciliation}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-success)] rounded-lg hover:opacity-90 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 active:scale-95"
            >
              Skip & Run Reconciliation
              <Play className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
