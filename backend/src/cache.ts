export class MemoryCache<T> {
  protected cache: T | null = null;
  protected expiryTime: number = 0;
  protected ttlMs: number;

  constructor(ttlMinutes: number = 60) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  set(data: T): void {
    this.cache = data;
    this.expiryTime = Date.now() + this.ttlMs;
  }

  clear(): void {
    this.cache = null;
    this.expiryTime = 0;
  }

  get(): T | null {
    return this.cache;
  }
}
