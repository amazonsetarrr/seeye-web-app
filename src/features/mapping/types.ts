export type DataType = 'string' | 'number' | 'date' | 'boolean';

export interface FieldMapping {
    id: string;
    sourceField: string;
    targetField: string;
    dataType: DataType;
    isKey: boolean;
    transformations?: string[];
    normalizedName?: string; // Optional normalized column name for normalization feature
}

export interface MappingConfig {
    sourceFileId: string;
    targetFileId: string;
    mappings: FieldMapping[];
}
