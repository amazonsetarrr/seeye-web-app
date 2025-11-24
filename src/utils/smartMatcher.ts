/**
 * Smart Matching Strategy
 * Combines multiple fuzzy matching algorithms with data normalization
 * for intelligent, context-aware string matching
 */

import {
    calculateSimilarity,
    jaroWinklerSimilarity,
    tokenSetRatio,
    partialRatio,
} from './fuzzyMatch';
import { smartNormalize, generateVariations } from './dataNormalizer';
import { memoize } from './memoizationCache';

export type MatchAlgorithm =
    | 'levenshtein'
    | 'jaro-winkler'
    | 'token-set'
    | 'partial'
    | 'multi-algorithm';

export interface MatchResult {
    score: number;
    algorithm: MatchAlgorithm;
    normalized1: string;
    normalized2: string;
    original1: string;
    original2: string;
}

/**
 * Multi-algorithm matcher - tries multiple algorithms and returns the best result
 * (Internal implementation without memoization)
 */
const multiAlgorithmMatchInternal = (str1: string, str2: string): MatchResult => {
    const original1 = str1;
    const original2 = str2;

    // Apply smart normalization
    const normalized1 = smartNormalize(str1);
    const normalized2 = smartNormalize(str2);

    // Try different algorithms
    const levenshteinScore = calculateSimilarity(normalized1, normalized2);
    const jaroWinklerScore = jaroWinklerSimilarity(normalized1, normalized2);
    const tokenSetScore = tokenSetRatio(normalized1, normalized2);
    const partialScore = partialRatio(normalized1, normalized2);

    // Weight the algorithms (some are better for certain types of data)
    const weighted = {
        levenshtein: levenshteinScore * 0.25,
        'jaro-winkler': jaroWinklerScore * 0.35,
        'token-set': tokenSetScore * 0.25,
        partial: partialScore * 0.15,
    };

    // Find the best algorithm (logic removed as it was unused)
    // let bestAlgorithm: MatchAlgorithm = 'levenshtein';
    // let bestScore = levenshteinScore;

    // if (jaroWinklerScore > bestScore) {
    //     bestAlgorithm = 'jaro-winkler';
    //     bestScore = jaroWinklerScore;
    // }
    // if (tokenSetScore > bestScore) {
    //     bestAlgorithm = 'token-set';
    //     bestScore = tokenSetScore;
    // }
    // if (partialScore > bestScore) {
    //     bestAlgorithm = 'partial';
    //     bestScore = partialScore;
    // }

    // Calculate weighted average for final score
    const finalScore = Object.values(weighted).reduce((a, b) => a + b, 0);

    return {
        score: finalScore,
        algorithm: 'multi-algorithm',
        normalized1,
        normalized2,
        original1,
        original2,
    };
};

/**
 * Multi-algorithm matcher with memoization
 */
export const multiAlgorithmMatch = memoize(multiAlgorithmMatchInternal, {
    maxSize: 5000,
    ttl: 10 * 60 * 1000, // 10 minutes
    keyGenerator: (str1, str2) => `${str1}|${str2}`,
});

/**
 * Variation-based matching - tries multiple normalized versions
 * (Internal implementation without memoization)
 */
const variationMatchInternal = (str1: string, str2: string, _threshold: number = 0.8): MatchResult => {
    const variations1 = generateVariations(str1);
    const variations2 = generateVariations(str2);

    let bestMatch: MatchResult | null = null;

    // Try all combinations of variations
    for (const v1 of variations1) {
        for (const v2 of variations2) {
            const match = multiAlgorithmMatchInternal(v1, v2);

            if (!bestMatch || match.score > bestMatch.score) {
                bestMatch = {
                    ...match,
                    original1: str1,
                    original2: str2,
                };
            }

            // Early exit if we found a perfect match
            if (match.score >= 0.98) {
                return bestMatch;
            }
        }
    }

    return bestMatch || {
        score: 0,
        algorithm: 'multi-algorithm',
        normalized1: smartNormalize(str1),
        normalized2: smartNormalize(str2),
        original1: str1,
        original2: str2,
    };
};

/**
 * Variation-based matching with memoization
 */
export const variationMatch = memoize(variationMatchInternal, {
    maxSize: 3000,
    ttl: 10 * 60 * 1000,
    keyGenerator: (str1, str2, threshold) => `${str1}|${str2}|${threshold}`,
});

/**
 * Smart compare - the main entry point for intelligent matching
 * (Internal implementation without memoization)
 */
const smartCompareInternal = (
    str1: string,
    str2: string,
    options: {
        threshold?: number;
        useVariations?: boolean;
        algorithm?: MatchAlgorithm;
    } = {}
): MatchResult => {
    const {
        threshold = 0.8,
        useVariations = true,
        algorithm = 'multi-algorithm',
    } = options;

    // If specific algorithm requested, use it
    if (algorithm !== 'multi-algorithm') {
        const normalized1 = smartNormalize(str1);
        const normalized2 = smartNormalize(str2);
        let score = 0;

        switch (algorithm) {
            case 'levenshtein':
                score = calculateSimilarity(normalized1, normalized2);
                break;
            case 'jaro-winkler':
                score = jaroWinklerSimilarity(normalized1, normalized2);
                break;
            case 'token-set':
                score = tokenSetRatio(normalized1, normalized2);
                break;
            case 'partial':
                score = partialRatio(normalized1, normalized2);
                break;
        }

        return {
            score,
            algorithm,
            normalized1,
            normalized2,
            original1: str1,
            original2: str2,
        };
    }

    // Use variation matching for best results
    if (useVariations) {
        return variationMatchInternal(str1, str2, threshold);
    }

    // Use multi-algorithm matching
    return multiAlgorithmMatchInternal(str1, str2);
};

/**
 * Smart compare with memoization
 */
export const smartCompare = memoize(smartCompareInternal, {
    maxSize: 5000,
    ttl: 10 * 60 * 1000,
    keyGenerator: (str1, str2, options) => `${str1}|${str2}|${JSON.stringify(options)}`,
});

/**
 * Compare composite keys using smart matching
 * (Internal implementation without memoization)
 */
const smartCompareCompositeKeysInternal = (
    keys1: string[],
    keys2: string[],
    threshold: number = 0.8
): { matches: boolean; score: number; details: MatchResult[] } => {
    if (keys1.length !== keys2.length) {
        return { matches: false, score: 0, details: [] };
    }

    const details: MatchResult[] = [];
    let totalScore = 0;

    for (let i = 0; i < keys1.length; i++) {
        const result = smartCompareInternal(keys1[i], keys2[i], { threshold });
        details.push(result);
        totalScore += result.score;
    }

    const averageScore = totalScore / keys1.length;

    return {
        matches: averageScore >= threshold,
        score: averageScore,
        details,
    };
};

/**
 * Compare composite keys with memoization
 */
export const smartCompareCompositeKeys = memoize(smartCompareCompositeKeysInternal, {
    maxSize: 5000,
    ttl: 10 * 60 * 1000,
    keyGenerator: (keys1, keys2, threshold) => `${keys1.join('|')}||${keys2.join('|')}||${threshold}`,
});
