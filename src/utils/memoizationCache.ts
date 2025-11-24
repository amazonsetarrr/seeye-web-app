/**
 * LRU Cache for memoizing expensive fuzzy matching operations
 */

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

export class LRUCache<K, V> {
    private cache: Map<string, CacheEntry<V>>;
    private maxSize: number;
    private ttl: number; // Time to live in milliseconds

    constructor(maxSize: number = 10000, ttl: number = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    private generateKey(key: K): string {
        if (typeof key === 'string') {
            return key;
        }
        return JSON.stringify(key);
    }

    get(key: K): V | undefined {
        const keyStr = this.generateKey(key);
        const entry = this.cache.get(keyStr);

        if (!entry) {
            return undefined;
        }

        // Check if entry has expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(keyStr);
            return undefined;
        }

        // Move to end (most recently used)
        this.cache.delete(keyStr);
        this.cache.set(keyStr, entry);

        return entry.value;
    }

    set(key: K, value: V): void {
        const keyStr = this.generateKey(key);

        // Delete if exists to update position
        if (this.cache.has(keyStr)) {
            this.cache.delete(keyStr);
        }

        // Remove oldest entry if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(keyStr, {
            value,
            timestamp: Date.now(),
        });
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

/**
 * Create a memoized version of a function with LRU cache
 */
export function memoize<Args extends any[], Result>(
    fn: (...args: Args) => Result,
    options: { maxSize?: number; ttl?: number; keyGenerator?: (...args: Args) => string } = {}
): (...args: Args) => Result {
    const { maxSize = 1000, ttl = 5 * 60 * 1000, keyGenerator } = options;
    const cache = new LRUCache<string, Result>(maxSize, ttl);

    return (...args: Args): Result => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        const cached = cache.get(key);

        if (cached !== undefined) {
            return cached;
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
