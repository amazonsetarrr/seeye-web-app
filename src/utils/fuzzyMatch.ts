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
export const fuzzyMatch = (str1: string, str2: string, threshold: number = 0.8): boolean => {
    const similarity = calculateSimilarity(str1, str2);
    return similarity >= threshold;
};

/**
 * Normalize string for comparison (lowercase, trim, remove extra spaces)
 */
export const normalizeString = (str: string): string => {
    return String(str || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
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
export const jaroWinklerSimilarity = (str1: string, str2: string, prefixScale: number = 0.1): number => {
    const jaroScore = jaroSimilarity(str1, str2);

    if (jaroScore < 0.7) return jaroScore;

    // Calculate common prefix length (up to 4 characters)
    let prefix = 0;
    const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));

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

/**
 * Compare two composite keys with fuzzy matching
 * Returns the average similarity across all key components
 */
export const compareCompositeKeys = (
    key1: string[],
    key2: string[],
    threshold: number = 0.8
): { matches: boolean; score: number } => {
    if (key1.length !== key2.length) {
        return { matches: false, score: 0 };
    }

    let totalSimilarity = 0;
    for (let i = 0; i < key1.length; i++) {
        const normalized1 = normalizeString(key1[i]);
        const normalized2 = normalizeString(key2[i]);
        totalSimilarity += calculateSimilarity(normalized1, normalized2);
    }

    const averageScore = totalSimilarity / key1.length;
    return {
        matches: averageScore >= threshold,
        score: averageScore,
    };
};
