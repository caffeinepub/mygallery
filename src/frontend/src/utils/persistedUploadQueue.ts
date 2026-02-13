const DB_NAME = 'upload-queue';
const STORE_NAME = 'uploads';
const DB_VERSION = 2;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

interface UploadQueueItem {
  itemId: string;
  name: string;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
  progress: number;
  timestamp: number;
  completed: boolean;
}

class PersistedUploadQueue {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async init() {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open upload queue DB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'itemId' });
        }
      };
    });

    return this.initPromise;
  }

  async enqueue(file: File, itemId: string, progress: number): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File ${file.name} exceeds size limit, skipping persistence`);
        return;
      }

      const bytes = new Uint8Array(await file.arrayBuffer());

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const item: UploadQueueItem = {
        itemId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        bytes,
        progress,
        timestamp: Date.now(),
        completed: false,
      };

      store.put(item);
    } catch (error) {
      console.error('Failed to enqueue upload:', error);
    }
  }

  async enqueueBytesDirectly(
    itemId: string,
    name: string,
    mimeType: string,
    size: number,
    bytes: Uint8Array,
    progress: number
  ): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      if (size > MAX_FILE_SIZE) {
        console.warn(`File ${name} exceeds size limit, skipping persistence`);
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const item: UploadQueueItem = {
        itemId,
        name,
        mimeType,
        size,
        bytes,
        progress,
        timestamp: Date.now(),
        completed: false,
      };

      store.put(item);
    } catch (error) {
      console.error('Failed to enqueue bytes:', error);
    }
  }

  async updateProgress(itemId: string, progress: number): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const getRequest = store.get(itemId);

      getRequest.onsuccess = () => {
        const item = getRequest.result as UploadQueueItem | undefined;
        if (item && !item.completed) {
          item.progress = progress;
          store.put(item);
        }
      };
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  async markCompleted(itemId: string): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const getRequest = store.get(itemId);

      getRequest.onsuccess = () => {
        const item = getRequest.result as UploadQueueItem | undefined;
        if (item) {
          item.completed = true;
          item.progress = 100;
          store.put(item);
        }
      };
    } catch (error) {
      console.error('Failed to mark completed:', error);
    }
  }

  async dequeue(itemId: string): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(itemId);
    } catch (error) {
      console.error('Failed to dequeue upload:', error);
    }
  }

  async getAll(): Promise<Array<{
    itemId: string;
    name: string;
    mimeType: string;
    size: number;
    bytes: Uint8Array;
    progress: number;
  }>> {
    try {
      await this.init();
      if (!this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const allItems = request.result as UploadQueueItem[];
          
          // Only return items that are not completed
          const pendingItems = allItems
            .filter(item => !item.completed)
            .map(item => ({
              itemId: item.itemId,
              name: item.name,
              mimeType: item.mimeType,
              size: item.size,
              bytes: item.bytes,
              progress: item.progress,
            }));

          resolve(pendingItems);
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
      await this.init();
      if (!this.db) return;

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
    } catch (error) {
      console.error('Failed to clear upload queue:', error);
    }
  }
}

export const persistedQueue = new PersistedUploadQueue();
