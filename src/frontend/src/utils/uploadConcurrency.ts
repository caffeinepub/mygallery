/**
 * Simple promise concurrency limiter for controlled parallel execution
 * Limits the number of concurrent promises without introducing new dependencies
 */

interface QueueItem<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class ConcurrencyLimiter {
  private queue: QueueItem<any>[] = [];
  private activeCount = 0;

  constructor(private maxConcurrency: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.activeCount++;

    try {
      const result = await item.fn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }
}

/**
 * Create a concurrency limiter with the specified max concurrent operations
 */
export function createConcurrencyLimiter(maxConcurrency: number): ConcurrencyLimiter {
  return new ConcurrencyLimiter(maxConcurrency);
}
