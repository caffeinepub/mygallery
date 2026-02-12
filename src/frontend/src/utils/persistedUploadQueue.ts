// Persisted upload queue for resuming uploads after refresh/restart
interface PersistedUploadItem {
  itemId: string;
  name: string;
  type: 'file';
  mimeType: string;
  size: number;
  bytes: number[]; // Array representation of Uint8Array for JSON serialization
  progress: number;
  timestamp: number;
}

const MAX_ITEM_SIZE = 50 * 1024 * 1024; // 50MB max per item for storage

export class PersistedUploadQueue {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MYLUploads', 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('uploads')) {
          db.createObjectStore('uploads', { keyPath: 'itemId' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }
    return this.db;
  }

  async enqueue(file: File, itemId: string, progress: number = 0): Promise<void> {
    try {
      // Skip files that are too large for storage
      if (file.size > MAX_ITEM_SIZE) {
        console.warn(`File ${file.name} too large for persistence (${file.size} bytes)`);
        return;
      }

      const db = await this.ensureDB();
      const arrayBuffer = await file.arrayBuffer();
      const bytes = Array.from(new Uint8Array(arrayBuffer));

      const item: PersistedUploadItem = {
        itemId,
        name: file.name,
        type: 'file',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        bytes,
        progress,
        timestamp: Date.now(),
      };

      const transaction = db.transaction(['uploads'], 'readwrite');
      const store = transaction.objectStore('uploads');
      store.put(item);

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Failed to enqueue upload:', error);
    }
  }

  async updateProgress(itemId: string, progress: number): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['uploads'], 'readwrite');
      const store = transaction.objectStore('uploads');
      const request = store.get(itemId);

      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const item = request.result;
          if (item) {
            item.progress = progress;
            store.put(item);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  async dequeue(itemId: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['uploads'], 'readwrite');
      const store = transaction.objectStore('uploads');
      store.delete(itemId);

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Failed to dequeue upload:', error);
    }
  }

  async getAll(): Promise<PersistedUploadItem[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['uploads'], 'readonly');
      const store = transaction.objectStore('uploads');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const items = request.result as PersistedUploadItem[];
          // Sort by timestamp (oldest first)
          items.sort((a, b) => a.timestamp - b.timestamp);
          resolve(items);
        };
        request.onerror = () => {
          console.error('Failed to get all uploads:', request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.error('Failed to get all uploads:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['uploads'], 'readwrite');
      const store = transaction.objectStore('uploads');
      store.clear();

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Failed to clear uploads:', error);
    }
  }
}

// Singleton instance
export const persistedQueue = new PersistedUploadQueue();
