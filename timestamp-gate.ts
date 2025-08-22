/**
 * Minimal in-memory singleton for per-ID timestamp gating.
 * - Stores only last-allowed timestamps (ms since epoch) per id.
 * - Call check(id) to check & update atomically:
 *    - If first time or elapsed >= ttlMs -> sets now and returns true
 *    - Otherwise returns false (unchanged)
 * - Pass your own `now` when batching or testing.
 */
export class TimestampGate {
  private static _instance: TimestampGate | null = null
  private readonly store: Map<string, number>
  private readonly defaultTTL: number

  private constructor (defaultTTL?: number) {
    if (TimestampGate._instance) return TimestampGate._instance
    this.store = new Map()
    this.defaultTTL = defaultTTL ?? 1000 * 60 * 5 // 5 minute default
  }

  /** Get the single shared instance. */
  static get instance (): TimestampGate {
    if (!this._instance) this._instance = new TimestampGate()
    return this._instance
  }

  /**
   * Check if `id` is allowed based on `ttl`. If allowed, persist `now`.
   * @param {string} id      Unique key to gate.
   * @param {number} now     Optional timestamp (ms). Defaults to Date.now() for minimal overhead.
   * @param {number?} ttl    Time-to-live in milliseconds.
   * @returns true if allowed (and stored), false otherwise.
   */
  check (id: string, now: number = Date.now(), ttl: number = this.defaultTTL): boolean {
    const last = this.store.get(id)
    if (last === undefined || (now - last) >= ttl) {
      this.store.set(id, now)
      return true
    }
    return false
  }

  /**
   * Peek the last-allowed timestamp (ms) for `id`.
   * @returns number | undefined
   */
  get (id: string): number | undefined {
    return this.store.get(id)
  }

  /**
   * Manually set a last-allowed timestamp (ms) for `id`.
   * Useful for backfilling/imports.
   */
  set (id: string, timestampMs: number): void {
    this.store.set(id, timestampMs)
  }

  /** Remove a single id. */
  delete (id: string): void {
    this.store.delete(id)
  }

  /** Drop everything (helps if you shard or rotate caches). */
  clear (): void {
    this.store.clear()
  }

  /**
   * Optional: prune entries whose last timestamp is older than `cutoffMs`.
   * Keeps memory lean if there is other operations that run on a schedules
   * or with enough frequency to effectively
   */
  pruneFrom (cutoffMs: number): void {
    for (const [id, ts] of this.store) {
      if (ts < cutoffMs) this.store.delete(id)
    }
  }

  /** Current number of tracked ids (for diagnostics). */
  size (): number {
    return this.store.size
  }
}
