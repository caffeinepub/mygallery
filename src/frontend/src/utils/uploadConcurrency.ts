type Task<T> = () => Promise<T>;

export function createConcurrencyLimiter(maxConcurrent: number) {
  let running = 0;
  const queue: Array<() => void> = [];

  return async function limit<T>(task: Task<T>): Promise<T> {
    while (running >= maxConcurrent) {
      await new Promise<void>(resolve => queue.push(resolve));
    }

    running++;
    try {
      return await task();
    } finally {
      running--;
      const next = queue.shift();
      if (next) {
        next();
      }
    }
  };
}
