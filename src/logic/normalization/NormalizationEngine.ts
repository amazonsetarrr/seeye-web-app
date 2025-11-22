import type { UploadedFile } from '../../features/file-management/types';
import type { NormalizationConfig, NormalizedDataset, NormalizedRecord, NormalizedColumn } from './types';

export class NormalizationEngine {
    private config: NormalizationConfig;

    constructor(config: NormalizationConfig) {
        this.config = config;
    }

    /**
     * Normalizes data from source and target files based on configuration
     */
    normalize(sourceFile: UploadedFile, targetFile: UploadedFile): NormalizedDataset {
        const columns = this.buildNormalizedColumns();
        const records: NormalizedRecord[] = [];

        if (this.config.mergeStrategy === 'separate') {
            // Create separate records for source and target
            records.push(...this.processSourceRecords(sourceFile, columns));
            records.push(...this.processTargetRecords(targetFile, columns));
        } else {
            // Union strategy - combine all unique records
            records.push(...this.processUnionRecords(sourceFile, targetFile, columns));
        }

        return {
            records,
            columns,
            metadata: {
                totalRecords: records.length,
                sourceRecords: sourceFile.rowCount,
                targetRecords: targetFile.rowCount,
                normalizedColumns: columns.length,
                timestamp: Date.now(),
            },
        };
    }

    /**
     * Build normalized column definitions from mappings
     */
    private buildNormalizedColumns(): NormalizedColumn[] {
        return this.config.mappings.map(mapping => {
            const normalizedName = this.config.normalizedColumnNames[mapping.id] || mapping.targetField;
            return {
                normalizedName,
                sourceColumn: mapping.sourceField,
                targetColumn: mapping.targetField,
            };
        });
    }

    /**
     * Process source records into normalized format
     */
    private processSourceRecords(sourceFile: UploadedFile, columns: NormalizedColumn[]): NormalizedRecord[] {
        return sourceFile.data.map((record, index) => {
            const normalizedData: Record<string, any> = {};

            columns.forEach(col => {
                normalizedData[col.normalizedName] = record[col.sourceColumn] ?? null;
            });

            return {
                id: `source-${index}`,
                source: 'SOURCE',
                data: normalizedData,
                originalSourceData: record,
            };
        });
    }

    /**
     * Process target records into normalized format
     */
    private processTargetRecords(targetFile: UploadedFile, columns: NormalizedColumn[]): NormalizedRecord[] {
        return targetFile.data.map((record, index) => {
            const normalizedData: Record<string, any> = {};

            columns.forEach(col => {
                normalizedData[col.normalizedName] = record[col.targetColumn] ?? null;
            });

            return {
                id: `target-${index}`,
                source: 'TARGET',
                data: normalizedData,
                originalTargetData: record,
            };
        });
    }

    /**
     * Process records using union strategy (all unique records)
     */
    private processUnionRecords(
        sourceFile: UploadedFile,
        targetFile: UploadedFile,
        columns: NormalizedColumn[]
    ): NormalizedRecord[] {
        const records: NormalizedRecord[] = [];

        // Add all source records
        sourceFile.data.forEach((record, index) => {
            const normalizedData: Record<string, any> = {};

            columns.forEach(col => {
                normalizedData[col.normalizedName] = record[col.sourceColumn] ?? null;
            });

            records.push({
                id: `union-source-${index}`,
                source: 'SOURCE',
                data: normalizedData,
                originalSourceData: record,
            });
        });

        // Add all target records
        targetFile.data.forEach((record, index) => {
            const normalizedData: Record<string, any> = {};

            columns.forEach(col => {
                normalizedData[col.normalizedName] = record[col.targetColumn] ?? null;
            });

            records.push({
                id: `union-target-${index}`,
                source: 'TARGET',
                data: normalizedData,
                originalTargetData: record,
            });
        });

        return records;
    }

    /**
     * Export normalized data to a simple array format
     */
    static exportToArray(dataset: NormalizedDataset): any[] {
        return dataset.records.map(record => ({
            ...record.data,
            _source: record.source,
        }));
    }

    /**
     * Get column headers for export
     */
    static getColumnHeaders(dataset: NormalizedDataset): string[] {
        return [...dataset.columns.map(col => col.normalizedName), '_source'];
    }
}
