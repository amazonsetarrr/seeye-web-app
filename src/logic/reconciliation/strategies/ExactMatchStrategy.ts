import type { ReconciliationStrategy, ReconciliationOptions } from '../types';
import type { MatchResult } from '../../../features/matching/types';
import { generateCompositeKeyArray } from '../utils';

export class ExactMatchStrategy implements ReconciliationStrategy {
    match(
        sourceRecord: any,
        targetData: any[],
        matchedTargetIndices: Set<number>,
        options: ReconciliationOptions
    ): MatchResult | null {
        const { mappings } = options;
        const keyMappings = mappings.filter((m) => m.isKey);

        if (keyMappings.length === 0) {
            return null;
        }

        const sourceKey = generateCompositeKeyArray(sourceRecord, keyMappings, 'source').join('|');

        // Find exact match
        const targetIndex = targetData.findIndex((targetRecord, index) => {
            if (matchedTargetIndices.has(index)) return false;
            const targetKey = generateCompositeKeyArray(targetRecord, keyMappings, 'target').join('|');
            return sourceKey === targetKey;
        });

        if (targetIndex !== -1) {
            return {
                id: crypto.randomUUID(),
                status: 'matched',
                sourceRecord,
                targetRecord: targetData[targetIndex],
                confidenceScore: 1.0,
                differences: {}, // Differences will be calculated by the engine or caller
                metadata: {
                    algorithm: 'exact' as any,
                    originalKeys: {
                        source: [sourceKey],
                        target: [sourceKey]
                    }
                }
            };
        }

        return null;
    }
}
