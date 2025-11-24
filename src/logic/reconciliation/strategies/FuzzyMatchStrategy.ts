import type { ReconciliationStrategy, ReconciliationOptions } from '../types';
import type { MatchResult } from '../../../features/matching/types';
import { generateCompositeKeyArray } from '../utils';
import { smartCompareCompositeKeys } from '../../../utils/smartMatcher';

export class FuzzyMatchStrategy implements ReconciliationStrategy {
    private targetKeysCache: Map<string, string[][]> = new Map();

    /**
     * Pre-compute all target keys for better performance
     * This reduces O(n²) by computing keys once instead of for each source record
     */
    private getOrComputeTargetKeys(
        targetData: any[],
        keyMappings: any[],
        cacheKey: string
    ): string[][] {
        if (this.targetKeysCache.has(cacheKey)) {
            return this.targetKeysCache.get(cacheKey)!;
        }

        const targetKeys = targetData.map(record =>
            generateCompositeKeyArray(record, keyMappings, 'target')
        );

        this.targetKeysCache.set(cacheKey, targetKeys);
        return targetKeys;
    }

    /**
     * Clear the cache when needed (e.g., new reconciliation session)
     */
    clearCache(): void {
        this.targetKeysCache.clear();
    }

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

        // Pre-compute all target keys once
        const cacheKey = `${keyMappings.map(m => m.id).join('|')}`;
        const targetKeys = this.getOrComputeTargetKeys(targetData, keyMappings, cacheKey);

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

            const targetKey = targetKeys[i];

            const comparison = smartCompareCompositeKeys(sourceKey, targetKey, threshold);

            if (comparison.matches) {
                // Early exit if we found a perfect match
                if (comparison.score >= 0.99) {
                    bestMatch = {
                        targetIndex: i,
                        score: comparison.score,
                        algorithm: comparison.details[0]?.algorithm || 'multi-algorithm',
                        normalizedSource: comparison.details.map(d => d.normalized1),
                        normalizedTarget: comparison.details.map(d => d.normalized2),
                    };
                    break;
                }

                if (!bestMatch || comparison.score > bestMatch.score) {
                    bestMatch = {
                        targetIndex: i,
                        score: comparison.score,
                        algorithm: comparison.details[0]?.algorithm || 'multi-algorithm',
                        normalizedSource: comparison.details.map(d => d.normalized1),
                        normalizedTarget: comparison.details.map(d => d.normalized2),
                    };
                }
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
