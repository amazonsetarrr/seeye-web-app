/**
 * Memoization Cache Utility
 * Provides caching for expensive function calls with TTL and size limits
 */

interface MemoizeOptions<Args extends any[]> {
    maxSize?: number;
    ttl?: number; // Time to live in milliseconds
    keyGenerator?: (...args: Args) => string;
}

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

/**
 * Creates a memoized version of a function with configurable cache
 */
export function memoize<Args extends any[], Return>(
    fn: (...args: Args) => Return,
    options: MemoizeOptions<Args> = {}
): (...args: Args) => Return {
    const {
        maxSize = 1000,
        ttl = 5 * 60 * 1000, // 5 minutes default
        keyGenerator = (...args) => JSON.stringify(args),
    } = options;

    const cache = new Map<string, CacheEntry<Return>>();

    return (...args: Args): Return => {
        const key = keyGenerator(...args);
        const now = Date.now();

        // Check if we have a valid cached entry
        const cached = cache.get(key);
        if (cached && now - cached.timestamp < ttl) {
            return cached.value;
        }

        // Compute the result
        const result = fn(...args);

        // Store in cache
        cache.set(key, { value: result, timestamp: now });

        // Cleanup old entries if cache is too large
        if (cache.size > maxSize) {
            const entriesToDelete = Math.floor(maxSize * 0.2); // Remove 20% of entries
            const sortedEntries = Array.from(cache.entries()).sort(
                (a, b) => a[1].timestamp - b[1].timestamp
            );

            for (let i = 0; i < entriesToDelete; i++) {
                cache.delete(sortedEntries[i][0]);
            }
        }

        return result;
    };
}

/**
 * Clear all memoization caches (useful for testing)
 */
export function clearMemoizationCaches(): void {
    // This would require tracking all memoized functions
    // For now, this is a placeholder for future enhancement
}
