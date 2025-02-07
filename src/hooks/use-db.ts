import { useEffect, useState } from 'react';

interface IndexedDBOptions {
  dbName: string;
  storeName: string;
  version?: number;
}

export function useIndexedDB<T>({
  dbName,
  storeName,
  version = 1,
}: IndexedDBOptions) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Ensure this only runs on the client side
    if (typeof window === 'undefined') return;

    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      setDb(database);
    };

    request.onerror = (event) => {
      setError(new Error('Error opening IndexedDB'));
    };

    return () => {
      if (db) db.close();
    };
  }, [dbName, storeName, version]);

  const add = (item: T): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  };

  const get = (id: string): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getAll = (): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const update = (item: T & { id: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const remove = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  return {
    db,
    error,
    add,
    get,
    getAll,
    update,
    remove,
  };
}
