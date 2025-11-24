import React, { useState } from 'react';
import type { NormalizedDataset } from './types';
import { Download, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { exportNormalizedDataToExcel } from '../../utils/exportHandler';
import { NormalizationEngine } from '../../logic/normalization/NormalizationEngine';

interface NormalizedDataTableProps {
    dataset: NormalizedDataset;
}

export const NormalizedDataTable: React.FC<NormalizedDataTableProps> = ({ dataset }) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleExport = () => {
        const exportData = NormalizationEngine.exportToArray(dataset);
        const headers = NormalizationEngine.getColumnHeaders(dataset);

        exportNormalizedDataToExcel(
            exportData,
            headers,
            `normalized_data_${new Date().toISOString().split('T')[0]}`
        );
    };

    // Filter records based on search
    let filteredRecords = dataset.records;
    if (searchTerm) {
        filteredRecords = filteredRecords.filter(record =>
            Object.values(record.data).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }

    // Sort records
    if (sortColumn) {
        filteredRecords = [...filteredRecords].sort((a, b) => {
            const aValue = a.data[sortColumn];
            const bValue = b.data[sortColumn];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = String(aValue).localeCompare(String(bValue));
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    // Pagination
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    const columnHeaders = dataset.columns.map(col => col.normalizedName);

    return (
        <div className="bg-[var(--glass-bg)] backdrop-blur-[var(--backdrop-blur)] border border-[var(--glass-border)] rounded-xl shadow-glass p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center">
                        <span className="w-2 h-8 bg-[var(--gradient-primary)] rounded-full mr-3"></span>
                        Normalized Dataset
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] ml-5">
                        {filteredRecords.length.toLocaleString()} records • {columnHeaders.length} columns
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none w-64"
                        />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-success)] rounded-lg hover:opacity-90 transition-all shadow-lg active:scale-95"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full">
                    <thead className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                                Source
                            </th>
                            {columnHeaders.map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--color-bg-app)] transition-colors"
                                    onClick={() => handleSort(header)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{header}</span>
                                        {sortColumn === header && (
                                            sortDirection === 'asc'
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--color-bg-app)] divide-y divide-[var(--color-border)]">
                        {paginatedRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-[var(--color-bg-surface)] transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded ${record.source === 'SOURCE'
                                                ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                                                : 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                                            }`}
                                    >
                                        {record.source}
                                    </span>
                                </td>
                                {columnHeaders.map((header) => (
                                    <td key={header} className="px-4 py-3 text-sm text-[var(--color-text-main)]">
                                        {record.data[header] ?? <span className="text-[var(--color-text-tertiary)]">—</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {paginatedRecords.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columnHeaders.length + 1}
                                    className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                                >
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-[var(--color-text-secondary)]">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of{' '}
                        {filteredRecords.length} records
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-[var(--color-text-secondary)]">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
