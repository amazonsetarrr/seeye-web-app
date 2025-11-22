import React, { useState, useEffect } from 'react';
import type { UploadedFile } from '../file-management/types';
import type { FieldMapping } from './types';
import { ArrowRight, Plus, Trash2, GripVertical } from 'lucide-react';
import { Reorder, AnimatePresence } from 'framer-motion';

interface MappingBoardProps {
    sourceFile: UploadedFile;
    targetFile: UploadedFile;
    onMappingChange: (mappings: FieldMapping[]) => void;
}

export const MappingBoard: React.FC<MappingBoardProps> = ({ sourceFile, targetFile, onMappingChange }) => {
    const [mappings, setMappings] = useState<FieldMapping[]>([]);

    // Auto-suggest mappings on init
    useEffect(() => {
        const suggested: FieldMapping[] = [];
        sourceFile.columns.forEach((sourceCol) => {
            const targetCol = targetFile.columns.find(
                (tCol) => tCol.toLowerCase() === sourceCol.toLowerCase()
            );
            if (targetCol) {
                suggested.push({
                    id: crypto.randomUUID(),
                    sourceField: sourceCol,
                    targetField: targetCol,
                    dataType: 'string',
                    isKey: false,
                });
            }
        });
        setMappings(suggested);
        onMappingChange(suggested);
    }, [sourceFile, targetFile]);

    const addMapping = () => {
        const newMapping: FieldMapping = {
            id: crypto.randomUUID(),
            sourceField: '',
            targetField: '',
            dataType: 'string',
            isKey: false,
        };
        setMappings([...mappings, newMapping]);
        onMappingChange([...mappings, newMapping]);
    };

    const updateMapping = (id: string, updates: Partial<FieldMapping>) => {
        const newMappings = mappings.map((m) => (m.id === id ? { ...m, ...updates } : m));
        setMappings(newMappings);
        onMappingChange(newMappings);
    };

    const removeMapping = (id: string) => {
        const newMappings = mappings.filter((m) => m.id !== id);
        setMappings(newMappings);
        onMappingChange(newMappings);
    };

    return (
        <div className="space-y-6">
            <div className="bg-[var(--glass-bg)] backdrop-blur-[var(--backdrop-blur)] border border-[var(--glass-border)] rounded-xl shadow-glass p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center">
                        <span className="w-2 h-8 bg-[var(--gradient-primary)] rounded-full mr-3"></span>
                        Active Mappings
                    </h3>
                    <button
                        onClick={addMapping}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Mapping
                    </button>
                </div>

                <Reorder.Group axis="y" values={mappings} onReorder={setMappings} className="space-y-3">
                    <AnimatePresence initial={false}>
                        {mappings.map((mapping) => (
                            <Reorder.Item
                                key={mapping.id}
                                value={mapping}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="cursor-grab active:cursor-grabbing text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4">
                                            <label className="block text-xs font-medium text-[var(--color-text-tertiary)] mb-1">Source Field ({sourceFile.name})</label>
                                            <select
                                                value={mapping.sourceField}
                                                onChange={(e) => updateMapping(mapping.id, { sourceField: e.target.value })}
                                                className="w-full px-3 py-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">Select field...</option>
                                                {sourceFile.columns.map((col) => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-1 flex justify-center pt-5">
                                            <ArrowRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                                        </div>

                                        <div className="col-span-4">
                                            <label className="block text-xs font-medium text-[var(--color-text-tertiary)] mb-1">Target Field ({targetFile.name})</label>
                                            <select
                                                value={mapping.targetField}
                                                onChange={(e) => updateMapping(mapping.id, { targetField: e.target.value })}
                                                className="w-full px-3 py-2 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">Select field...</option>
                                                {targetFile.columns.map((col) => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-3 flex items-end gap-2">
                                            <button
                                                onClick={() => updateMapping(mapping.id, { isKey: !mapping.isKey })}
                                                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-all ${mapping.isKey
                                                    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]'
                                                    : 'bg-transparent text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
                                                    }`}
                                                title="Toggle Key Field"
                                            >
                                                {mapping.isKey ? 'KEY' : 'Set Key'}
                                            </button>
                                            <button
                                                onClick={() => removeMapping(mapping.id)}
                                                className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] rounded-md transition-colors"
                                                title="Remove Mapping"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>

                {mappings.length === 0 && (
                    <div className="text-center py-12 text-[var(--color-text-tertiary)] bg-[var(--color-bg-app)] rounded-lg border border-dashed border-[var(--color-border)]">
                        <p>No mappings yet. Add one to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
