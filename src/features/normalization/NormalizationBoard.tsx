import React, { useState, useEffect } from 'react';
import type { UploadedFile } from '../file-management/types';
import type { FieldMapping } from '../mapping/types';
import type { NormalizedDataset } from './types';
import { NormalizationEngine } from '../../logic/normalization/NormalizationEngine';
import { Database, Download, ArrowRightLeft, Edit2, Check } from 'lucide-react';
import { NormalizedDataTable } from './NormalizedDataTable';

interface NormalizationBoardProps {
    sourceFile: UploadedFile;
    targetFile: UploadedFile;
    mappings: FieldMapping[];
    onNormalizationComplete: (dataset: NormalizedDataset) => void;
}

export const NormalizationBoard: React.FC<NormalizationBoardProps> = ({
    sourceFile,
    targetFile,
    mappings,
    onNormalizationComplete,
}) => {
    const [normalizedNames, setNormalizedNames] = useState<Record<string, string>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [mergeStrategy, setMergeStrategy] = useState<'separate' | 'union'>('union');
    const [normalizedData, setNormalizedData] = useState<NormalizedDataset | null>(null);

    // Initialize normalized names from mappings
    useEffect(() => {
        const names: Record<string, string> = {};
        mappings.forEach((mapping) => {
            if (!mapping.sourceField || !mapping.targetField) return;

            // Use existing normalizedName if available, otherwise use targetField
            names[mapping.id] = mapping.normalizedName || mapping.targetField;
        });
        setNormalizedNames(names);
    }, [mappings]);

    const handleNormalize = () => {
        const config = {
            mappings: mappings.filter(m => m.sourceField && m.targetField),
            normalizedColumnNames: normalizedNames,
            mergeStrategy,
        };

        const engine = new NormalizationEngine(config);
        const result = engine.normalize(sourceFile, targetFile);
        setNormalizedData(result);
        onNormalizationComplete(result);
    };

    const updateNormalizedName = (id: string, name: string) => {
        setNormalizedNames({ ...normalizedNames, [id]: name });
    };

    const validMappings = mappings.filter(m => m.sourceField && m.targetField);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-[var(--glass-bg)] backdrop-blur-[var(--backdrop-blur)] border border-[var(--glass-border)] rounded-xl shadow-glass p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center mb-2">
                            <span className="w-2 h-8 bg-[var(--gradient-primary)] rounded-full mr-3"></span>
                            Normalization Configuration
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] ml-5">
                            Define normalized column names to combine data from both sources
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-[var(--color-text-tertiary)] mb-1">Merge Strategy</div>
                            <select
                                value={mergeStrategy}
                                onChange={(e) => setMergeStrategy(e.target.value as 'separate' | 'union')}
                                className="px-3 py-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                            >
                                <option value="union">Union (All Records)</option>
                                <option value="separate">Separate (Source + Target)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                        <div className="text-2xl font-bold text-[var(--color-primary)]">{validMappings.length}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Mapped Fields</div>
                    </div>
                    <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                        <div className="text-2xl font-bold text-[var(--color-accent)]">{sourceFile.rowCount + targetFile.rowCount}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Total Records ({mergeStrategy})</div>
                    </div>
                    <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                        <div className="text-2xl font-bold text-[var(--color-success)]">
                            {normalizedData ? normalizedData.records.length : '—'}
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Normalized Records</div>
                    </div>
                </div>

                {/* Column Mapping Configuration */}
                <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-[var(--color-text-tertiary)] border-b border-[var(--color-border)]">
                        <div className="col-span-4">Source Column</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-4">Target Column</div>
                        <div className="col-span-3">Normalized Name</div>
                    </div>

                    {validMappings.map((mapping) => (
                        <div
                            key={mapping.id}
                            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-[var(--color-primary)]" />
                                        <span className="text-sm font-medium text-[var(--color-text-main)]">
                                            {mapping.sourceField}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[var(--color-text-tertiary)] ml-6">
                                        {sourceFile.name}
                                    </div>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <ArrowRightLeft className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                                </div>

                                <div className="col-span-4">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-[var(--color-accent)]" />
                                        <span className="text-sm font-medium text-[var(--color-text-main)]">
                                            {mapping.targetField}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[var(--color-text-tertiary)] ml-6">
                                        {targetFile.name}
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    {editingId === mapping.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={normalizedNames[mapping.id] || ''}
                                                onChange={(e) => updateNormalizedName(mapping.id, e.target.value)}
                                                className="flex-1 px-3 py-2 bg-[var(--color-bg-app)] border border-[var(--color-primary)] rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                                placeholder="Column name..."
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 text-[var(--color-success)] hover:bg-[var(--color-success-bg)] rounded-md transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-md cursor-pointer hover:border-[var(--color-primary)] transition-colors group"
                                            onClick={() => setEditingId(mapping.id)}
                                        >
                                            <span className="flex-1 text-sm font-semibold text-[var(--color-success)]">
                                                {normalizedNames[mapping.id] || mapping.targetField}
                                            </span>
                                            <Edit2 className="w-3 h-3 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {validMappings.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-text-tertiary)] bg-[var(--color-bg-app)] rounded-lg border border-dashed border-[var(--color-border)]">
                            <p>No field mappings configured. Please complete the mapping step first.</p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                {validMappings.length > 0 && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleNormalize}
                            className="flex items-center px-6 py-3 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                        >
                            <Database className="w-4 h-4 mr-2" />
                            Apply Normalization
                        </button>
                    </div>
                )}
            </div>

            {/* Normalized Data Preview */}
            {normalizedData && (
                <NormalizedDataTable dataset={normalizedData} />
            )}
        </div>
    );
};
