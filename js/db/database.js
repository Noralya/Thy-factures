// database.js
// Thin wrapper around IndexedDB. All data stays on-device, nothing is sent anywhere.

const DB_NAME = 'invoicing-db';
const DB_VERSION = 1;

const STORES = {
  profile: 'profile',       // single record, key = 'main'
  clients: 'clients',
  services: 'services',
  invoices: 'invoices',
  settings: 'settings',     // single record, key = 'main'
  counters: 'counters'      // invoice numbering counters, key = year or scheme id
};

let dbPromise = null;

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.profile)) {
        db.createObjectStore(STORES.profile, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.clients)) {
        const store = db.createObjectStore(STORES.clients, { keyPath: 'id' });
        store.createIndex('byName', ['lastName', 'firstName'], { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.services)) {
        db.createObjectStore(STORES.services, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.invoices)) {
        const store = db.createObjectStore(STORES.invoices, { keyPath: 'id' });
        store.createIndex('byNumber', 'number', { unique: false });
        store.createIndex('byClient', 'clientId', { unique: false });
        store.createIndex('byStatus', 'status', { unique: false });
        store.createIndex('byIssueDate', 'issueDate', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.counters)) {
        db.createObjectStore(STORES.counters, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });

  return dbPromise;
}

function tx(storeName, mode) {
  return openDatabase().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const DB = {
  STORES,

  async get(storeName, key) {
    const store = await tx(storeName, 'readonly');
    return promisifyRequest(store.get(key));
  },

  async getAll(storeName) {
    const store = await tx(storeName, 'readonly');
    return promisifyRequest(store.getAll());
  },

  async put(storeName, value) {
    const store = await tx(storeName, 'readwrite');
    return promisifyRequest(store.put(value));
  },

  async delete(storeName, key) {
    const store = await tx(storeName, 'readwrite');
    return promisifyRequest(store.delete(key));
  },

  async clear(storeName) {
    const store = await tx(storeName, 'readwrite');
    return promisifyRequest(store.clear());
  },

  async count(storeName) {
    const store = await tx(storeName, 'readonly');
    return promisifyRequest(store.count());
  }
};

export default DB;
