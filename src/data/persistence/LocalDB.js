/**
 * LocalDB.js
 *
 * Initialises and exports the IndexedDB database instance used for all local
 * object persistence. This module has NO Firebase / Supabase imports — it is
 * the pure local-storage layer.
 *
 * Stores:
 *   books      – cached book metadata documents
 *   series     – cached series documents (includes embedded volumes array)
 *   progress   – reading progress keyed as `${userId}_${bookId}`
 *   settings   – user settings keyed by userId
 *   syncQueue  – pending writes to replay when the network reconnects
 */

import { openDB } from 'idb'

const DB_NAME = 'book-reader-db'
const DB_VERSION = 1

let _dbPromise = null

/**
 * Returns a singleton promise that resolves to the opened IDBDatabase.
 * Safe to call multiple times — the DB is only opened once.
 */
export function getDB() {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // ----- books -----
        if (!db.objectStoreNames.contains('books')) {
          const books = db.createObjectStore('books', { keyPath: 'id' })
          books.createIndex('ownerId', 'ownerId', { unique: false })
        }

        // ----- series -----
        if (!db.objectStoreNames.contains('series')) {
          db.createObjectStore('series', { keyPath: 'id' })
        }

        // ----- progress -----
        if (!db.objectStoreNames.contains('progress')) {
          const progress = db.createObjectStore('progress', { keyPath: 'id' })
          progress.createIndex('userId', 'userId', { unique: false })
        }

        // ----- settings -----
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'userId' })
        }

        // ----- syncQueue -----
        // Records: { id (auto), collection, docId, payload, retries, createdAt }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queue = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          })
          queue.createIndex('collection', 'collection', { unique: false })
          queue.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  return _dbPromise
}

/** Clear the cached promise — useful in tests or after a forced DB reset. */
export function resetDBCache() {
  _dbPromise = null
}
