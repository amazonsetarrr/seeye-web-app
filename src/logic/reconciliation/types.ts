import type { FieldMapping } from '../../features/mapping/types';
import type { MatchResult } from '../../features/matching/types';

export interface ReconciliationOptions {
    mappings: FieldMapping[];
    threshold?: number;
}

export interface ReconciliationStrategy {
    match(
        sourceRecord: any,
        targetData: any[],
        matchedTargetIndices: Set<number>,
        options: ReconciliationOptions
    ): MatchResult | null;
}

export type StrategyType = 'exact' | 'fuzzy';
