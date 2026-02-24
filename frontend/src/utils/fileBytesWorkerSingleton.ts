import type { FileBytesRequest, FileBytesResponse } from '@/workers/fileBytes.worker';

type PendingRequest = {
  resolve: (bytes: Uint8Array) => void;
  reject: (error: Error) => void;
  file: File;
};

class FileBytesWorkerSingleton {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private concurrencyLimit = 3;
  private activeRequests = 0;
  private queue: Array<{ itemId: string; request: PendingRequest }> = [];

  initialize() {
    if (this.worker) return;

    this.worker = new Worker(
      new URL('../workers/fileBytes.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.addEventListener('message', this.handleMessage);
    this.worker.addEventListener('error', this.handleError);
  }

  private handleMessage = (e: MessageEvent<FileBytesResponse>) => {
    const { itemId, bytes, error } = e.data;
    const pending = this.pendingRequests.get(itemId);

    if (!pending) return;

    this.pendingRequests.delete(itemId);
    this.activeRequests--;

    if (error) {
      pending.reject(new Error(error));
    } else {
      // Create a proper Uint8Array from the transferred buffer
      const standardBytes = new Uint8Array(bytes.buffer);
      pending.resolve(standardBytes);
    }

    // Process next queued request
    this.processQueue();
  };

  private handleError = (error: ErrorEvent) => {
    console.error('Worker error:', error);
    // Reject all pending requests
    this.pendingRequests.forEach((pending) => {
      pending.reject(new Error('Worker error'));
    });
    this.pendingRequests.clear();
    this.activeRequests = 0;
    this.queue = [];
  };

  private processQueue() {
    while (this.activeRequests < this.concurrencyLimit && this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) break;

      this.executeRequest(next.itemId, next.request);
    }
  }

  private executeRequest(itemId: string, request: PendingRequest) {
    if (!this.worker) {
      request.reject(new Error('Worker not initialized'));
      return;
    }

    this.activeRequests++;
    this.pendingRequests.set(itemId, request);

    const workerRequest: FileBytesRequest = {
      file: request.file,
      itemId,
    };

    this.worker.postMessage(workerRequest);
  }

  readFileBytes(file: File, itemId: string): Promise<Uint8Array> {
    this.initialize();

    return new Promise((resolve, reject) => {
      const request: PendingRequest = { resolve, reject, file };

      if (this.activeRequests < this.concurrencyLimit) {
        this.executeRequest(itemId, request);
      } else {
        this.queue.push({ itemId, request });
      }
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessage);
      this.worker.removeEventListener('error', this.handleError);
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
    this.activeRequests = 0;
    this.queue = [];
  }
}

export const fileBytesWorker = new FileBytesWorkerSingleton();
