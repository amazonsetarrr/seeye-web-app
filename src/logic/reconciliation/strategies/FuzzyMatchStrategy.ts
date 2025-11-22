import type { ReconciliationStrategy, ReconciliationOptions } from '../types';
import type { MatchResult } from '../../../features/matching/types';
import { generateCompositeKeyArray } from '../utils';
import { smartCompareCompositeKeys } from '../../../utils/smartMatcher';

export class FuzzyMatchStrategy implements ReconciliationStrategy {
    match(
        sourceRecord: any,
        targetData: any[],
        matchedTargetIndices: Set<number>,
        options: ReconciliationOptions
    ): MatchResult | null {
        const { mappings, threshold = 0.8 } = options;
        const keyMappings = mappings.filter((m) => m.isKey);

        if (keyMappings.length === 0) {
            return null;
        }

        const sourceKey = generateCompositeKeyArray(sourceRecord, keyMappings, 'source');

        let bestMatch: {
            targetIndex: number;
            score: number;
            algorithm: string;
            normalizedSource: string[];
            normalizedTarget: string[];
        } | null = null;

        // Iterate through all target records to find the best match
        for (let i = 0; i < targetData.length; i++) {
            if (matchedTargetIndices.has(i)) continue;

            const targetRecord = targetData[i];
            const targetKey = generateCompositeKeyArray(targetRecord, keyMappings, 'target');

            const comparison = smartCompareCompositeKeys(sourceKey, targetKey, threshold);

            if (comparison.matches && (!bestMatch || comparison.score > bestMatch.score)) {
                bestMatch = {
                    targetIndex: i,
                    score: comparison.score,
                    algorithm: comparison.details[0]?.algorithm || 'multi-algorithm',
                    normalizedSource: comparison.details.map(d => d.normalized1),
                    normalizedTarget: comparison.details.map(d => d.normalized2),
                };
            }
        }

        if (bestMatch) {
            return {
                id: crypto.randomUUID(),
                status: 'matched',
                sourceRecord,
                targetRecord: targetData[bestMatch.targetIndex],
                confidenceScore: bestMatch.score,
                differences: {}, // Differences will be calculated by the engine
                metadata: {
                    algorithm: bestMatch.algorithm as any,
                    normalizedKeys: {
                        source: bestMatch.normalizedSource,
                        target: bestMatch.normalizedTarget,
                    },
                    originalKeys: {
                        source: sourceKey,
                        target: generateCompositeKeyArray(targetData[bestMatch.targetIndex], keyMappings, 'target'),
                    },
                },
            };
        }

        return null;
    }
}
