type CacheEntry<T> = { value: T; expires: number };

export class MemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  constructor(private ttlMs: number) {}

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T) {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}

export const candleCache = new MemoryCache<any>(1000 * 60 * 60 * 6);
export const fundamentalsCache = new MemoryCache<any>(1000 * 60 * 60 * 12);
