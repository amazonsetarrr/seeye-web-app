import { ArrowRight } from 'lucide-react';
import { ResultsGrid } from '../features/results/ResultsGrid';
import type { ReconciliationResult } from '../features/matching/types';
import type { FieldMapping } from '../features/mapping/types';

interface ReconciliationViewProps {
  results: ReconciliationResult | null;
  mappings: FieldMapping[];
  onViewReport: () => void;
}

export function ReconciliationView({
  results,
  mappings,
  onViewReport,
}: ReconciliationViewProps) {
  if (!results) {
    return (
      <div className="text-center text-gray-500 py-8">
        No reconciliation results available. Please run reconciliation first.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Reconciliation Workspace</h2>
        <button
          onClick={onViewReport}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all"
        >
          View Report
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
      <ResultsGrid results={results} mappings={mappings} />
    </div>
  );
}
