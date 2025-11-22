import React, { useState } from 'react';
import type { UploadedFile } from './types';
import { FileSpreadsheet, Trash2, Eye, ArrowUpDown } from 'lucide-react';
import { DataViewerModal } from './DataViewerModal';

interface FilePreviewProps {
    files: UploadedFile[];
    onRemoveFile: (id: string) => void;
    onSwapFiles?: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemoveFile, onSwapFiles }) => {
    const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);

    return (
        <>
            <div className="space-y-4 w-full h-full flex flex-col">
                <div className="flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-semibold text-[var(--color-text-main)]">Uploaded Files ({files.length})</h3>
                    {files.length === 2 && onSwapFiles && (
                        <button
                            onClick={onSwapFiles}
                            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium flex items-center gap-1 transition-colors"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            Swap Source/Target
                        </button>
                    )}
                </div>

                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-sm flex-grow flex flex-col">
                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[var(--color-bg-app)] text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">File Name</th>
                                    <th className="px-4 py-3 font-medium">Rows</th>
                                    <th className="px-4 py-3 font-medium">Columns</th>
                                    <th className="px-4 py-3 font-medium">Size</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {files.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FileSpreadsheet className="w-8 h-8 opacity-20" />
                                                <p>No files uploaded yet</p>
                                                <p className="text-xs">Upload source and target files to begin</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    files.map((file, index) => (
                                        <tr key={file.id} className="hover:bg-[var(--color-bg-surface-hover)] transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {index === 0 && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                                        Source
                                                    </span>
                                                )}
                                                {index === 1 && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                                        Target
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FileSpreadsheet className="w-4 h-4 text-[var(--color-primary)]" />
                                                    <span className="font-medium text-[var(--color-text-main)]">{file.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-secondary)]">
                                                {file.rowCount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-secondary)]">
                                                {file.columns.length}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-secondary)]">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setViewingFile(file)}
                                                        className="p-1.5 hover:bg-[var(--color-bg-app)] rounded text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                                                        title="View Data"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onRemoveFile(file.id)}
                                                        className="p-1.5 hover:bg-red-50 rounded text-[var(--color-text-secondary)] hover:text-red-600 transition-colors"
                                                        title="Remove File"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DataViewerModal
                file={viewingFile}
                isOpen={!!viewingFile}
                onClose={() => setViewingFile(null)}
            />
        </>
    );
};
