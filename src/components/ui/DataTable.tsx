import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
}

interface DataTableProps {
    data: any[];
    columns: Column[];
    pageSize?: number;
    className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
    key: string;
    direction: SortDirection;
}

export const DataTable: React.FC<DataTableProps> = ({
    data,
    columns,
    pageSize = 10,
    className = ''
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [globalSearch, setGlobalSearch] = useState('');

    // Handle Sorting
    const handleSort = (key: string) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }
        setSortConfig({ key, direction });
    };

    // Handle Filter Change
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Process Data
    const processedData = useMemo(() => {
        let result = [...data];

        // 1. Global Search
        if (globalSearch) {
            const searchLower = globalSearch.toLowerCase();
            result = result.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(searchLower)
                )
            );
        }

        // 2. Column Filters
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key].toLowerCase();
            if (filterValue) {
                result = result.filter(row =>
                    String(row[key] || '').toLowerCase().includes(filterValue)
                );
            }
        });

        // 3. Sorting
        if (sortConfig.key && sortConfig.direction) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, globalSearch, filters, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / pageSize);
    const paginatedData = processedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Global Search & Controls */}
            <div className="flex items-center justify-between">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search all columns..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none w-64 transition-all shadow-sm group-hover:shadow-md"
                    />
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                    Showing {processedData.length} records
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--bg-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--color-bg-app)] text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap min-w-[150px]">
                                        <div className="space-y-2">
                                            <div
                                                className={`flex items-center space-x-1 ${col.sortable ? 'cursor-pointer hover:text-[var(--color-text-main)]' : ''}`}
                                                onClick={() => col.sortable && handleSort(col.key)}
                                            >
                                                <span>{col.label}</span>
                                                {col.sortable && (
                                                    <span className="text-[var(--color-text-tertiary)]">
                                                        {sortConfig.key === col.key ? (
                                                            sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                                                                sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> :
                                                                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                                                        ) : (
                                                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {col.filterable && (
                                                <input
                                                    type="text"
                                                    placeholder={`Filter ${col.label}...`}
                                                    value={filters[col.key] || ''}
                                                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] focus:border-[var(--color-primary)] outline-none transition-colors"
                                                />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-[var(--color-bg-surface-hover)] transition-colors">
                                        {columns.map((col) => (
                                            <td key={`${idx}-${col.key}`} className="px-4 py-2 whitespace-nowrap text-[var(--color-text-main)]">
                                                {String(row[col.key] || '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--color-text-tertiary)]">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-[var(--color-text-secondary)]">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-bg-surface-hover)] transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-bg-surface-hover)] transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
