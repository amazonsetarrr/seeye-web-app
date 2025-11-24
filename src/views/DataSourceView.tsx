import { ArrowRight } from 'lucide-react';
import { UploadArea } from '../features/file-management/UploadArea';
import { FilePreview } from '../features/file-management/FilePreview';
import type { UploadedFile } from '../features/file-management/types';

interface DataSourceViewProps {
  files: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  onRemoveFile: (id: string) => void;
  onSwapFiles: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function DataSourceView({
  files,
  onFilesUploaded,
  onRemoveFile,
  onSwapFiles,
  onNext,
  canProceed,
}: DataSourceViewProps) {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <section className="text-center space-y-2 flex-shrink-0">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Data Source</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-base">
          Upload your CSV or Excel files to compare, match, and reconcile data discrepancies automatically.
        </p>
      </section>

      <div className="grid grid-cols-12 gap-6 flex-grow overflow-hidden">
        <section className="col-span-5 h-full overflow-y-auto pr-2">
          <UploadArea
            onFilesUploaded={onFilesUploaded}
            currentFileCount={files.length}
          />
        </section>

        <section className="col-span-7 h-full overflow-y-auto pl-2 border-l border-[var(--color-border)]">
          <FilePreview
            files={files}
            onRemoveFile={onRemoveFile}
            onSwapFiles={onSwapFiles}
          />
        </section>
      </div>

      {canProceed && (
        <div className="flex justify-end pt-4 flex-shrink-0">
          <button
            onClick={onNext}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
          >
            Next: Map Fields
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}
