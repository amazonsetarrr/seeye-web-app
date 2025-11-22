import React, { useCallback, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { parseFile } from '../../utils/fileParser';
import type { UploadedFile } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadAreaProps {
    onFilesUploaded: (files: UploadedFile[]) => void;
    currentFileCount: number;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFilesUploaded, currentFileCount }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const maxFiles = 2;
    const remainingSlots = maxFiles - currentFileCount;
    const isLimitReached = remainingSlots <= 0;

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!isLimitReached) {
            setIsDragging(true);
        }
    }, [isLimitReached]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFiles = useCallback(async (files: File[]) => {
        if (isLimitReached) {
            setError('Maximum of 2 files allowed. Please remove a file to upload a new one.');
            return;
        }

        if (files.length > remainingSlots) {
            setError(`You can only upload ${remainingSlots} more file${remainingSlots === 1 ? '' : 's'}.`);
            return;
        }

        setIsProcessing(true);
        setError(null);
        const processedFiles: UploadedFile[] = [];

        try {
            for (const file of files) {
                if (file.size > 50 * 1024 * 1024) {
                    throw new Error(`File ${file.name} exceeds 50MB limit`);
                }
                const processed = await parseFile(file);
                processedFiles.push(processed);
            }
            onFilesUploaded(processedFiles);
        } catch (err: any) {
            setError(err.message || 'Failed to process files');
        } finally {
            setIsProcessing(false);
            setIsDragging(false);
        }
    }, [onFilesUploaded, isLimitReached, remainingSlots]);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (isLimitReached) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        await processFiles(files);
    }, [processFiles, isLimitReached]);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            await processFiles(files);
            // Reset input value to allow selecting the same file again if needed (though unlikely with limit)
            e.target.value = '';
        }
    };

    const getUploadMessage = () => {
        if (isProcessing) return 'Processing files...';
        if (isLimitReached) return 'Maximum files uploaded';
        if (currentFileCount === 0) return 'Upload Source File';
        if (currentFileCount === 1) return 'Upload Target File';
        return 'Drop files here or click to upload';
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                layout
                className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${isDragging
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)] scale-[1.02] shadow-xl'
                    : isLimitReached
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--glass-bg)] backdrop-blur-[var(--backdrop-blur)] shadow-sm hover:shadow-md'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls"
                    className={`absolute inset-0 w-full h-full opacity-0 z-10 ${isLimitReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onChange={handleFileInput}
                    disabled={isProcessing || isLimitReached}
                />

                <div className="flex flex-col items-center justify-center space-y-6 pointer-events-none">
                    <div className={`p-6 rounded-2xl transition-colors duration-300 ${isDragging ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-indigo-500/30' : 'bg-[var(--color-bg-app)] text-[var(--color-primary)]'}`}>
                        <UploadCloud className={`w-10 h-10 ${isLimitReached ? 'text-gray-400' : ''}`} />
                    </div>
                    <div className="space-y-2">
                        <h3 className={`text-xl font-bold ${isLimitReached ? 'text-gray-400' : 'text-[var(--color-text-main)]'}`}>
                            {getUploadMessage()}
                        </h3>
                        <p className={`text-sm ${isLimitReached ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'}`}>
                            {isLimitReached ? 'Remove a file to upload a new one' : 'Support for CSV, Excel (max 50MB)'}
                        </p>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 bg-red-50 text-red-600 rounded-md flex items-center justify-between border border-red-100"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
