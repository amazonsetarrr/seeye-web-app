/**
 * Smart Matching Engine
 * Combines multiple fuzzy matching algorithms with data normalization
 * for intelligent, context-aware string matching
 *
 * Consolidates fuzzyMatch.ts and smartMatcher.ts into a single unified service
 * Performance optimizations: Memoization for expensive matching operations
 */

import { smartNormalize, generateVariations } from './normalization.service';
import { ALGORITHM_WEIGHTS, DEFAULT_THRESHOLDS, NORMALIZATION_CONFIG } from '../config/matching.config';
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

// ============================================================================
// CORE ALGORITHMS
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * This measures the minimum number of single-character edits required to change one string into another
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create a 2D array for dynamic programming
    const dp: number[][] = Array(len1 + 1)
        .fill(null)
        .map(() => Array(len2 + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= len1; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
        dp[0][j] = j;
    }

    // Fill the dp table
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,     // deletion
                    dp[i][j - 1] + 1,     // insertion
                    dp[i - 1][j - 1] + 1  // substitution
                );
            }
        }
    }

    return dp[len1][len2];
};

/**
 * Calculate similarity score between two strings (0 to 1)
 * 1 = identical, 0 = completely different
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    if (maxLength === 0) return 1.0;

    return 1 - distance / maxLength;
};

/**
 * Check if two strings match based on a similarity threshold
 */
export const fuzzyMatch = (str1: string, str2: string, threshold: number = DEFAULT_THRESHOLDS.FUZZY_MEDIUM): boolean => {
    const similarity = calculateSimilarity(str1, str2);
    return similarity >= threshold;
};

/**
 * Jaro similarity between two strings
 * Better for short strings and transposition errors
 */
export const jaroSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const len1 = str1.length;
    const len2 = str2.length;

    // Maximum allowed distance for matching characters
    const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

    const str1Matches = new Array(len1).fill(false);
    const str2Matches = new Array(len2).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Find matches
    for (let i = 0; i < len1; i++) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(i + matchDistance + 1, len2);

        for (let j = start; j < end; j++) {
            if (str2Matches[j] || str1[i] !== str2[j]) continue;
            str1Matches[i] = true;
            str2Matches[j] = true;
            matches++;
            break;
        }
    }

    if (matches === 0) return 0.0;

    // Find transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
        if (!str1Matches[i]) continue;
        while (!str2Matches[k]) k++;
        if (str1[i] !== str2[k]) transpositions++;
        k++;
    }

    return (
        (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3
    );
};

/**
 * Jaro-Winkler similarity (favors strings with common prefixes)
 * Excellent for names and identifiers
 */
export const jaroWinklerSimilarity = (str1: string, str2: string, prefixScale: number = NORMALIZATION_CONFIG.JARO_PREFIX_SCALE): number => {
    const jaroScore = jaroSimilarity(str1, str2);

    if (jaroScore < NORMALIZATION_CONFIG.JARO_BOOST_THRESHOLD) return jaroScore;

    // Calculate common prefix length (up to 4 characters)
    let prefix = 0;
    const maxPrefix = Math.min(NORMALIZATION_CONFIG.MAX_PREFIX_LENGTH, Math.min(str1.length, str2.length));

    for (let i = 0; i < maxPrefix; i++) {
        if (str1[i] === str2[i]) prefix++;
        else break;
    }

    return jaroScore + prefix * prefixScale * (1 - jaroScore);
};

/**
 * Token-based matching (handles word order differences)
 * "John Smith" matches "Smith, John"
 */
export const tokenSetRatio = (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const tokens1 = str1.toLowerCase().split(/\s+/).filter(t => t.length > 0).sort();
    const tokens2 = str2.toLowerCase().split(/\s+/).filter(t => t.length > 0).sort();

    const set1 = tokens1.join(' ');
    const set2 = tokens2.join(' ');

    if (set1 === set2) return 1.0;

    // Use Levenshtein on sorted tokens
    return calculateSimilarity(set1, set2);
};

/**
 * Partial ratio - checks if one string is contained in another
 * Useful for matching substrings
 */
export const partialRatio = (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const shorter = str1.length <= str2.length ? str1.toLowerCase() : str2.toLowerCase();
    const longer = str1.length > str2.length ? str1.toLowerCase() : str2.toLowerCase();

    if (longer.includes(shorter)) {
        return shorter.length / longer.length;
    }

    // Find best matching substring
    let bestRatio = 0;
    for (let i = 0; i <= longer.length - shorter.length; i++) {
        const substring = longer.substring(i, i + shorter.length);
        const ratio = calculateSimilarity(shorter, substring);
        bestRatio = Math.max(bestRatio, ratio);
    }

    return bestRatio;
};

// ============================================================================
// COMPOSITE KEY MATCHING
// ============================================================================

/**
 * Compare two composite keys with fuzzy matching
 * Returns the average similarity across all key components
 */
export const compareCompositeKeys = (
    key1: string[],
    key2: string[],
    threshold: number = DEFAULT_THRESHOLDS.FUZZY_MEDIUM
): { matches: boolean; score: number } => {
    if (key1.length !== key2.length) {
        return { matches: false, score: 0 };
    }

    let totalSimilarity = 0;
    for (let i = 0; i < key1.length; i++) {
        const normalized1 = smartNormalize(key1[i]);
        const normalized2 = smartNormalize(key2[i]);
        totalSimilarity += calculateSimilarity(normalized1, normalized2);
    }

    const averageScore = totalSimilarity / key1.length;
    return {
        matches: averageScore >= threshold,
        score: averageScore,
    };
};

/**
 * Compare composite keys using smart matching
 * (Internal implementation without memoization)
 */
const smartCompareCompositeKeysInternal = (
    keys1: string[],
    keys2: string[],
    threshold: number = DEFAULT_THRESHOLDS.FUZZY_MEDIUM
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
 * Compare composite keys with memoization for performance
 */
export const smartCompareCompositeKeys = memoize(smartCompareCompositeKeysInternal, {
    maxSize: 5000,
    ttl: 10 * 60 * 1000, // 10 minutes
    keyGenerator: (keys1, keys2, threshold) => `${keys1.join('|')}||${keys2.join('|')}||${threshold}`,
});

// ============================================================================
// MULTI-ALGORITHM MATCHING
// ============================================================================

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
        levenshtein: levenshteinScore * ALGORITHM_WEIGHTS.LEVENSHTEIN,
        'jaro-winkler': jaroWinklerScore * ALGORITHM_WEIGHTS.JARO_WINKLER,
        'token-set': tokenSetScore * ALGORITHM_WEIGHTS.TOKEN_SET,
        partial: partialScore * ALGORITHM_WEIGHTS.PARTIAL,
    };

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
 * Multi-algorithm matcher with memoization for performance
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
const variationMatchInternal = (str1: string, str2: string, _threshold: number = DEFAULT_THRESHOLDS.FUZZY_MEDIUM): MatchResult => {
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
            if (match.score >= NORMALIZATION_CONFIG.PERFECT_MATCH_THRESHOLD) {
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
 * Variation-based matching with memoization for performance
 */
export const variationMatch = memoize(variationMatchInternal, {
    maxSize: 3000,
    ttl: 10 * 60 * 1000, // 10 minutes
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
        threshold = DEFAULT_THRESHOLDS.FUZZY_MEDIUM,
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
 * Smart compare with memoization for performance
 */
export const smartCompare = memoize(smartCompareInternal, {
    maxSize: 5000,
    ttl: 10 * 60 * 1000, // 10 minutes
    keyGenerator: (str1, str2, options) => `${str1}|${str2}|${JSON.stringify(options)}`,
});
