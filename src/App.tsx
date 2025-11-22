import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { UploadArea } from './features/file-management/UploadArea';
import { FilePreview } from './features/file-management/FilePreview';
import { MappingBoard } from './features/mapping/MappingBoard';
import { NormalizationBoard } from './features/normalization/NormalizationBoard';
import { ResultsGrid } from './features/results/ResultsGrid';
import { Home } from './features/dashboard/Home';
import { Settings } from './features/settings/Settings';
import { Layout } from './components/Layout';
import type { View } from './components/Sidebar';
import { reconcileData } from './features/matching/engine';
import type { UploadedFile } from './features/file-management/types';
import type { FieldMapping } from './features/mapping/types';
import type { ReconciliationResult } from './features/matching/types';
import type { NormalizedDataset } from './features/normalization/types';
import { exportToExcel } from './utils/exportHandler';
import { JobStore } from './utils/store';
import { ArrowRight, Play, Download } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [normalizedData, setNormalizedData] = useState<NormalizedDataset | null>(null);
  const [results, setResults] = useState<ReconciliationResult | null>(null);
  const [strategy, setStrategy] = useState<'exact' | 'fuzzy'>('fuzzy');

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSwapFiles = () => {
    if (files.length < 2) return;
    setFiles((prev) => {
      const newFiles = [...prev];
      const temp = newFiles[0];
      newFiles[0] = newFiles[1];
      newFiles[1] = temp;
      return newFiles;
    });
  };

  const runReconciliation = () => {
    if (files.length < 2) return;

    const result = reconcileData(files[0], files[1], {
      mappings,
      fuzzyThreshold: 0.8,
      strategy,
    });

    setResults(result);
    setCurrentView('reconciliation');

    // Save job to history
    JobStore.addJob({
      name: `${files[0].name} vs ${files[1].name}`,
      status: result.summary.conflicts > 0 ? 'Review Needed' : 'Completed',
      items: result.summary.total,
    });
  };

  const stepsStatus = {
    datasource: files.length >= 2,
    mapping: mappings.some(m => m.isKey),
    normalization: !!normalizedData,
    reconciliation: !!results,
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <Home />;

      case 'datasource':
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
                  onFilesUploaded={handleFilesUploaded}
                  currentFileCount={files.length}
                />
              </section>

              <section className="col-span-7 h-full overflow-y-auto pl-2 border-l border-[var(--color-border)]">
                <FilePreview
                  files={files}
                  onRemoveFile={handleRemoveFile}
                  onSwapFiles={handleSwapFiles}
                />
              </section>
            </div>

            {stepsStatus.datasource && (
              <div className="flex justify-end pt-4 flex-shrink-0">
                <button
                  onClick={() => setCurrentView('mapping')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                >
                  Next: Map Fields
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        );

      case 'mapping':
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Map Fields</h2>
              <p className="text-[var(--color-text-secondary)]">
                Map columns from <strong>{files[0]?.name}</strong> to <strong>{files[1]?.name}</strong> to define how records should be compared.
              </p>
            </div>
            <MappingBoard
              sourceFile={files[0]}
              targetFile={files[1]}
              onMappingChange={setMappings}
            />
            {stepsStatus.mapping && (
              <div className="flex flex-col items-end gap-4 mt-8">
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="text-sm font-medium text-gray-600 pl-2">Match Strategy:</span>
                  <div className="flex bg-gray-100 p-1 rounded-md">
                    <button
                      onClick={() => setStrategy('exact')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${strategy === 'exact'
                        ? 'bg-white text-[var(--color-primary)] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Exact Match
                    </button>
                    <button
                      onClick={() => setStrategy('fuzzy')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${strategy === 'fuzzy'
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
                    onClick={() => setCurrentView('normalization')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                  >
                    Next: Normalize Data
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                  <button
                    onClick={runReconciliation}
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

      case 'normalization':
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Normalization</h2>
              <p className="text-[var(--color-text-secondary)]">
                Combine data from both sources into a single normalized table with unified column names.
              </p>
            </div>
            <NormalizationBoard
              sourceFile={files[0]}
              targetFile={files[1]}
              mappings={mappings}
              onNormalizationComplete={setNormalizedData}
            />
          </div>
        );

      case 'reconciliation':
        return results ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Reconciliation Workspace</h2>
              <button
                onClick={() => setCurrentView('report')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all"
              >
                View Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            <ResultsGrid results={results} mappings={mappings} />
          </div>
        ) : null;

      case 'report':
        return results ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Reconciliation Report</h2>
              <button
                onClick={() => exportToExcel(results)}
                className="flex items-center px-4 py-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-subtle)] rounded-md hover:bg-[var(--color-bg-surface-hover)] transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500">Total Records</div>
                <div className="text-2xl font-bold">{results.summary.total}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg shadow-sm border border-green-100">
                <div className="text-sm text-green-600">Matched</div>
                <div className="text-2xl font-bold text-green-700">{results.summary.matched}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg shadow-sm border border-red-100">
                <div className="text-sm text-red-600">Conflicts</div>
                <div className="text-2xl font-bold text-red-700">{results.summary.conflicts}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg shadow-sm border border-yellow-100">
                <div className="text-sm text-yellow-600">Orphans</div>
                <div className="text-2xl font-bold text-yellow-700">
                  {results.summary.orphans.source + results.summary.orphans.target}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Summary Analysis</h3>
              <p className="text-gray-600">
                The reconciliation process compared <strong>{results.summary.total}</strong> records.
                We found <strong>{results.summary.matched}</strong> exact matches and <strong>{results.summary.conflicts}</strong> conflicts that require attention.
                There are <strong>{results.summary.orphans.source}</strong> records in the source file that are missing in the target, and <strong>{results.summary.orphans.target}</strong> records in the target missing from the source.
              </p>
            </div>
          </div>
        ) : null;

      case 'settings':
        return <Settings />;

      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider>
      <Layout currentView={currentView} onNavigate={setCurrentView} stepsStatus={stepsStatus}>
        {renderContent()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
