import { Download } from 'lucide-react';
import { exportToExcel } from '../utils/exportHandler';
import type { ReconciliationResult } from '../features/matching/types';

interface ReportViewProps {
  results: ReconciliationResult | null;
}

export function ReportView({ results }: ReportViewProps) {
  if (!results) {
    return (
      <div className="text-center text-gray-500 py-8">
        No report available. Please run reconciliation first.
      </div>
    );
  }

  return (
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
  );
}
