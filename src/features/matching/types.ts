import type { FieldMapping } from '../mapping/types';
import type { MatchAlgorithm } from '../../utils/smartMatcher';

export type MatchStatus = 'matched' | 'orphan' | 'conflict' | 'duplicate';

export interface MatchMetadata {
    algorithm: MatchAlgorithm;
    normalizedKeys?: {
        source: string[];
        target: string[];
    };
    originalKeys?: {
        source: string[];
        target: string[];
    };
}

export interface MatchResult {
    id: string;
    status: MatchStatus;
    sourceRecord?: any;
    targetRecord?: any;
    confidenceScore: number;
    differences: Record<string, { source: any; target: any }>;
    metadata?: MatchMetadata;
}

export interface ReconciliationResult {
    summary: {
        total: number;
        matched: number;
        orphans: {
            source: number;
            target: number;
        };
        conflicts: number;
    };
    results: MatchResult[];
}

export interface MatchConfig {
    mappings: FieldMapping[];
    fuzzyThreshold: number; // 0-1
    strategy?: 'exact' | 'fuzzy';
}
