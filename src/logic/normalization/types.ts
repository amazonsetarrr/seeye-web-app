import type { FieldMapping } from '../../features/mapping/types';

export interface NormalizedColumn {
    normalizedName: string;
    sourceColumn: string;
    targetColumn: string;
}

export interface NormalizedRecord {
    id: string;
    source: 'SOURCE' | 'TARGET' | 'MERGED';
    data: Record<string, any>;
    originalSourceData?: Record<string, any>;
    originalTargetData?: Record<string, any>;
}

export interface NormalizedDataset {
    records: NormalizedRecord[];
    columns: NormalizedColumn[];
    metadata: {
        totalRecords: number;
        sourceRecords: number;
        targetRecords: number;
        normalizedColumns: number;
        timestamp: number;
    };
}

export interface NormalizationConfig {
    mappings: FieldMapping[];
    normalizedColumnNames: Record<string, string>; // mapping id -> normalized name
    mergeStrategy: 'separate' | 'union'; // separate rows or union all
}
