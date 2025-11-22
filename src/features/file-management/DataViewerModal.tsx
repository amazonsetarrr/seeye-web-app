import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import type { UploadedFile } from './types';

interface DataViewerModalProps {
    file: UploadedFile | null;
    isOpen: boolean;
    onClose: () => void;
}

export const DataViewerModal: React.FC<DataViewerModalProps> = ({ file, isOpen, onClose }) => {
    if (!file) return null;

    const columns = file.columns.map(col => ({
        key: col,
        label: col,
        sortable: true,
        filterable: true
    }));

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-10 bg-[var(--color-bg-app)] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[var(--color-border)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[var(--color-primary-subtle)] rounded-lg text-[var(--color-primary)]">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-text-main)]">{file.name}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {file.rowCount} rows • {file.columns.length} columns
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[var(--color-bg-surface-hover)] rounded-full text-[var(--color-text-secondary)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden p-6 bg-[var(--color-bg-app)]">
                            <div className="h-full overflow-auto">
                                <DataTable
                                    data={file.data}
                                    columns={columns}
                                    pageSize={50}
                                    className="h-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
