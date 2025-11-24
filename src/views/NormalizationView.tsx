import { NormalizationBoard } from '../features/normalization/NormalizationBoard';
import type { UploadedFile } from '../features/file-management/types';
import type { FieldMapping } from '../features/mapping/types';
import type { NormalizedDataset } from '../features/normalization/types';

interface NormalizationViewProps {
  sourceFile?: UploadedFile;
  targetFile?: UploadedFile;
  mappings: FieldMapping[];
  onNormalizationComplete: (data: NormalizedDataset | null) => void;
}

export function NormalizationView({
  sourceFile,
  targetFile,
  mappings,
  onNormalizationComplete,
}: NormalizationViewProps) {
  if (!sourceFile || !targetFile) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please upload files and create mappings before normalization.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Normalization</h2>
        <p className="text-[var(--color-text-secondary)]">
          Combine data from both sources into a single normalized table with unified column names.
        </p>
      </div>

      <NormalizationBoard
        sourceFile={sourceFile}
        targetFile={targetFile}
        mappings={mappings}
        onNormalizationComplete={onNormalizationComplete}
      />
    </div>
  );
}
