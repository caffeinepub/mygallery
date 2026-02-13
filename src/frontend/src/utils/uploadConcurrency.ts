type QueuedTask<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
};

export function createConcurrencyLimiter(limit: number) {
  let activeCount = 0;
  const queue: QueuedTask<any>[] = [];

  async function processNext() {
    if (queue.length === 0 || activeCount >= limit) {
      return;
    }

    const task = queue.shift();
    if (!task) return;

    activeCount++;

    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      activeCount--;
      processNext();
    }
  }

  return function limitedExecution<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      processNext();
    });
  };
}

export function createCancellableLimiter(limit: number) {
  let activeCount = 0;
  const queue: QueuedTask<any>[] = [];
  let cancelled = false;

  async function processNext() {
    if (cancelled || queue.length === 0 || activeCount >= limit) {
      return;
    }

    const task = queue.shift();
    if (!task) return;

    activeCount++;

    try {
      const result = await task.fn();
      if (!cancelled) {
        task.resolve(result);
      }
    } catch (error) {
      if (!cancelled) {
        task.reject(error);
      }
    } finally {
      activeCount--;
      if (!cancelled) {
        processNext();
      }
    }
  }

  return {
    execute<T>(fn: () => Promise<T>): Promise<T> {
      if (cancelled) {
        return Promise.reject(new Error('Limiter cancelled'));
      }

      return new Promise<T>((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        processNext();
      });
    },
    cancel() {
      cancelled = true;
      queue.forEach(task => task.reject(new Error('Cancelled')));
      queue.length = 0;
    },
    getStats() {
      return {
        activeCount,
        queuedCount: queue.length,
        cancelled,
      };
    },
  };
}
