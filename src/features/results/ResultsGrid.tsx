import React, { useState } from 'react';
import type { ReconciliationResult } from '../matching/types';
import type { FieldMapping } from '../mapping/types';
import { Check, AlertTriangle, X, Search, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsGridProps {
    results: ReconciliationResult;
    mappings: FieldMapping[];
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, mappings }) => {
    const [filter, setFilter] = useState<'all' | 'matched' | 'conflict' | 'orphan'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const filteredResults = results.results.filter((r) => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const sourceStr = r.sourceRecord ? JSON.stringify(r.sourceRecord).toLowerCase() : '';
            const targetStr = r.targetRecord ? JSON.stringify(r.targetRecord).toLowerCase() : '';
            return sourceStr.includes(searchLower) || targetStr.includes(searchLower);
        }
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'matched': return 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]';
            case 'conflict': return 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]';
            case 'orphan': return 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]';
            default: return 'bg-[var(--color-bg-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'matched': return <Check className="w-3 h-3" />;
            case 'conflict': return <AlertTriangle className="w-3 h-3" />;
            case 'orphan': return <X className="w-3 h-3" />;
            default: return null;
        }
    };

    const getAlgorithmBadge = (algorithm: string) => {
        const colors: Record<string, string> = {
            'levenshtein': 'bg-blue-100 text-blue-700 border-blue-200',
            'jaro-winkler': 'bg-purple-100 text-purple-700 border-purple-200',
            'token-set': 'bg-green-100 text-green-700 border-green-200',
            'partial': 'bg-orange-100 text-orange-700 border-orange-200',
            'multi-algorithm': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };

        const labels: Record<string, string> = {
            'levenshtein': 'Exact',
            'jaro-winkler': 'Fuzzy',
            'token-set': 'Token',
            'partial': 'Partial',
            'multi-algorithm': 'Smart',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[algorithm] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {labels[algorithm] || algorithm}
            </span>
        );
    };

    const getMatchKey = (result: any) => {
        const keyMappings = mappings.filter(m => m.isKey);
        if (keyMappings.length === 0) return '-';

        const record = result.sourceRecord || result.targetRecord;
        if (!record) return '-';

        const isSource = !!result.sourceRecord;

        return keyMappings.map(m => {
            const field = isSource ? m.sourceField : m.targetField;
            const value = record[field];
            return `${m.sourceField}: ${value}`;
        }).join(', ');
    };

    const renderRecord = (record: any, isSource: boolean) => {
        if (!record) return '-';

        return (
            <div className="space-y-1 text-xs">
                {mappings.map(m => {
                    const field = isSource ? m.sourceField : m.targetField;
                    const value = record[field];
                    const isKey = m.isKey;

                    if (value === undefined || value === null || value === '') return null;

                    return (
                        <div key={m.id} className={`flex ${isKey ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                            <span className="w-24 flex-shrink-0 truncate opacity-70" title={field}>{field}:</span>
                            <span className="flex-1 truncate" title={String(value)}>{String(value)}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const toggleRowExpansion = (rowId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    };

    const renderExpandedRow = (result: any) => {
        const sourceRecord = result.sourceRecord;
        const targetRecord = result.targetRecord;

        // Helper to sort mappings: matches first, then mismatches
        const sortedMappings = [...mappings].sort((a, b) => {
            const getStatus = (m: FieldMapping, record1: any, record2: any) => {
                const val1 = record1?.[m.sourceField];
                const val2 = record2?.[m.targetField];
                // If both records exist, check for equality. If one is missing, it's a mismatch.
                if (record1 && record2) {
                    return val1 === val2 ? 0 : 1; // 0 for match, 1 for mismatch
                }
                return 1; // Mismatch if one record is missing
            };

            const statusA = getStatus(a, sourceRecord, targetRecord);
            const statusB = getStatus(b, sourceRecord, targetRecord);

            if (statusA !== statusB) return statusA - statusB;
            return 0;
        });

        return (
            <motion.tr
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
            >
                <td colSpan={5} className="px-6 py-4 bg-[var(--color-bg-surface)]">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-[var(--color-text-main)]">Detailed Comparison</h4>
                            {result.metadata?.algorithm && (
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                    <span>Matched using:</span>
                                    {getAlgorithmBadge(result.metadata.algorithm)}
                                </div>
                            )}
                        </div>

                        {/* Side-by-side comparison */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Source Column */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <h5 className="text-xs font-semibold text-[var(--color-text-main)] uppercase tracking-wide">Source Record</h5>
                                </div>
                                {sourceRecord ? (
                                    <div className="space-y-1.5">
                                        {sortedMappings.map(m => {
                                            const sourceValue = sourceRecord[m.sourceField];
                                            const targetValue = targetRecord?.[m.targetField];
                                            const isDifferent = sourceValue !== targetValue && targetRecord;
                                            const isKey = m.isKey;

                                            if (sourceValue === undefined || sourceValue === null || sourceValue === '') return null;

                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`flex items-start gap-2 py-1 px-2 rounded ${isDifferent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                                                        }`}
                                                >
                                                    <span className={`text-xs font-medium min-w-[100px] ${isKey ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                                                        }`}>
                                                        {m.sourceField}:
                                                    </span>
                                                    <span className="text-xs text-[var(--color-text-main)] flex-1 break-words">
                                                        {String(sourceValue)}
                                                    </span>
                                                    {isDifferent && (
                                                        <X className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    {!isDifferent && targetRecord && (
                                                        <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-xs text-[var(--color-text-tertiary)] italic py-4 text-center">
                                        No source record
                                    </div>
                                )}
                            </div>

                            {/* Target Column */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <h5 className="text-xs font-semibold text-[var(--color-text-main)] uppercase tracking-wide">Target Record</h5>
                                </div>
                                {targetRecord ? (
                                    <div className="space-y-1.5">
                                        {sortedMappings.map(m => {
                                            const targetValue = targetRecord[m.targetField];
                                            const sourceValue = sourceRecord?.[m.sourceField];
                                            const isDifferent = sourceValue !== targetValue && sourceRecord;
                                            const isKey = m.isKey;

                                            if (targetValue === undefined || targetValue === null || targetValue === '') return null;

                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`flex items-start gap-2 py-1 px-2 rounded ${isDifferent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                                                        }`}
                                                >
                                                    <span className={`text-xs font-medium min-w-[100px] ${isKey ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                                                        }`}>
                                                        {m.targetField}:
                                                    </span>
                                                    <span className="text-xs text-[var(--color-text-main)] flex-1 break-words">
                                                        {String(targetValue)}
                                                    </span>
                                                    {isDifferent && (
                                                        <X className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    {!isDifferent && sourceRecord && (
                                                        <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-xs text-[var(--color-text-tertiary)] italic py-4 text-center">
                                        No target record
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Match metadata */}
                        {result.metadata?.normalizedKeys && (
                            <div className="pt-3 border-t border-[var(--color-border)]">
                                <div className="text-xs space-y-1">
                                    <div className="flex gap-2">
                                        <span className="font-medium text-[var(--color-text-secondary)]">Original Keys:</span>
                                        <span className="text-[var(--color-text-main)]">
                                            {result.metadata.originalKeys?.source?.join(', ') || '-'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-medium text-[var(--color-text-secondary)]">Normalized Keys:</span>
                                        <span className="text-[var(--color-text-main)]">
                                            {result.metadata.normalizedKeys.source?.join(', ') || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </td>
            </motion.tr>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex space-x-2 bg-[var(--color-bg-surface)] p-1 rounded-lg border border-[var(--color-border)] shadow-sm">
                    {['all', 'matched', 'conflict', 'orphan'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${filter === f
                                ? 'bg-[var(--color-bg-app)] text-[var(--color-text-main)] shadow-sm'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none w-64 transition-all shadow-sm group-hover:shadow-md"
                    />
                </div>
            </div>

            <div className="bg-[var(--glass-bg)] backdrop-blur-[var(--backdrop-blur)] border border-[var(--glass-border)] rounded-xl overflow-hidden shadow-glass">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--color-bg-app)] text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Match Key</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Confidence</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Source Record</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Target Record</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {filteredResults.slice(0, 100).map((result) => {
                                const isExpanded = expandedRows.has(result.id);
                                return (
                                    <React.Fragment key={result.id}>
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-[var(--color-bg-surface-hover)] transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleRowExpansion(result.id)}
                                                        className="p-1 hover:bg-[var(--color-bg-surface)] rounded transition-colors"
                                                        aria-label={isExpanded ? "Collapse row" : "Expand row"}
                                                    >
                                                        <ChevronDown
                                                            className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </button>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm ${getStatusColor(result.status)}`}>
                                                        <span className="mr-1.5">{getStatusIcon(result.status)}</span>
                                                        {result.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-main)]">
                                                {getMatchKey(result)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {result.confidenceScore > 0 ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${result.confidenceScore >= 0.9 ? 'bg-green-500' : result.confidenceScore >= 0.7 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                                                                    style={{ width: `${result.confidenceScore * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                                                                {(result.confidenceScore * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        {result.metadata?.algorithm && (
                                                            <div className="flex items-center space-x-1">
                                                                {getAlgorithmBadge(result.metadata.algorithm)}
                                                                {result.metadata.normalizedKeys && (
                                                                    <div className="group relative">
                                                                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                                                                        <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg -left-2 top-5">
                                                                            <div className="font-medium mb-1">Match Details:</div>
                                                                            <div className="space-y-1 text-gray-300">
                                                                                <div>Original: {result.metadata.originalKeys?.source.join(', ')}</div>
                                                                                <div>Normalized: {result.metadata.normalizedKeys.source.join(', ')}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[var(--color-text-tertiary)]">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs text-[var(--color-text-main)]">
                                                {renderRecord(result.sourceRecord, true)}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs text-[var(--color-text-main)]">
                                                {renderRecord(result.targetRecord, false)}
                                            </td>
                                        </motion.tr>
                                        <AnimatePresence>
                                            {isExpanded && renderExpandedRow(result)}
                                        </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredResults.length > 100 && (
                        <div className="p-4 text-center text-sm text-[var(--color-text-tertiary)] bg-[var(--color-bg-app)] border-t border-[var(--color-border)]">
                            Showing first 100 results of {filteredResults.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
