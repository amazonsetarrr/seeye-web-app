import type { UploadedFile } from '../../features/file-management/types';
import type { MatchConfig, ReconciliationResult, MatchResult } from '../../features/matching/types';
import type { ReconciliationStrategy } from './types';
import { ExactMatchStrategy } from './strategies/ExactMatchStrategy';
import { FuzzyMatchStrategy } from './strategies/FuzzyMatchStrategy';

export class ReconciliationEngine {
    private strategy: ReconciliationStrategy;

    constructor(strategyType: 'exact' | 'fuzzy' = 'exact') {
        this.strategy = strategyType === 'fuzzy' ? new FuzzyMatchStrategy() : new ExactMatchStrategy();
    }

    public setStrategy(strategyType: 'exact' | 'fuzzy') {
        this.strategy = strategyType === 'fuzzy' ? new FuzzyMatchStrategy() : new ExactMatchStrategy();
    }

    public reconcile(
        sourceFile: UploadedFile,
        targetFile: UploadedFile,
        config: MatchConfig
    ): ReconciliationResult {
        const { mappings, fuzzyThreshold } = config;
        const results: MatchResult[] = [];
        const matchedTargetIndices = new Set<number>();
        const matchedSourceIndices = new Set<number>();

        // 1. Iterate through source records and find matches using the strategy
        for (let sourceIndex = 0; sourceIndex < sourceFile.data.length; sourceIndex++) {
            const sourceRecord = sourceFile.data[sourceIndex];

            const match = this.strategy.match(
                sourceRecord,
                targetFile.data,
                matchedTargetIndices,
                { mappings, threshold: fuzzyThreshold }
            );

            if (match) {
                // Find the index of the matched target record to mark it as used
                const targetIndex = targetFile.data.indexOf(match.targetRecord);
                if (targetIndex !== -1) {
                    matchedTargetIndices.add(targetIndex);
                }

                matchedSourceIndices.add(sourceIndex);

                // Calculate differences
                const differences = this.findDifferences(sourceRecord, match.targetRecord, mappings);
                const status = Object.keys(differences).length > 0 ? 'conflict' : 'matched';

                results.push({
                    ...match,
                    status,
                    differences
                });
            } else {
                // Orphan (Source only)
                results.push({
                    id: crypto.randomUUID(),
                    status: 'orphan',
                    sourceRecord,
                    confidenceScore: 0,
                    differences: {},
                });
            }
        }

        // 2. Find Orphans (Target only)
        for (let index = 0; index < targetFile.data.length; index++) {
            if (!matchedTargetIndices.has(index)) {
                results.push({
                    id: crypto.randomUUID(),
                    status: 'orphan',
                    targetRecord: targetFile.data[index],
                    confidenceScore: 0,
                    differences: {},
                });
            }
        }

        return this.calculateSummary(results);
    }

    private findDifferences(source: any, target: any, mappings: any[]) {
        const diffs: Record<string, { source: any; target: any }> = {};

        mappings.forEach((m) => {
            if (m.isKey) return; // Skip keys as they matched

            const sourceVal = String(source[m.sourceField] || '').trim();
            const targetVal = String(target[m.targetField] || '').trim();

            if (sourceVal !== targetVal) {
                diffs[m.sourceField] = { source: sourceVal, target: targetVal };
            }
        });

        return diffs;
    }

    private calculateSummary(results: MatchResult[]): ReconciliationResult {
        const summary = {
            total: results.length,
            matched: 0,
            orphans: { source: 0, target: 0 },
            conflicts: 0,
        };

        results.forEach((r) => {
            if (r.status === 'matched') summary.matched++;
            if (r.status === 'conflict') summary.conflicts++;
            if (r.status === 'orphan') {
                if (r.sourceRecord) summary.orphans.source++;
                else summary.orphans.target++;
            }
        });

        return { summary, results };
    }
}
