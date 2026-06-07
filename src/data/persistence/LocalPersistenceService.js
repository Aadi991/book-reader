/**
 * LocalPersistenceService.js
 *
 * High-level CRUD wrapper over IndexedDB (via LocalDB).
 *
 * Responsibilities:
 *   - Object-level persistence for books, series, progress, settings
 *   - Offline sync queue management (enqueue / dequeue writes)
 *
 * This service has ZERO Firebase / Supabase imports.
 * It is the pure local-state authority. Repositories call this service
 * alongside FirestoreService to implement cache-first reads and
 * offline-safe writes.
 */

import { getDB } from './LocalDB'

class LocalPersistenceService {
  // ─── BOOKS ───────────────────────────────────────────────────────────────

  /** Return all cached book documents. */
  async getBooks() {
    const db = await getDB()
    return db.getAll('books')
  }

  /** Replace the entire books cache with the given array. */
  async putBooks(books) {
    const db = await getDB()
    const tx = db.transaction('books', 'readwrite')
    await Promise.all([
      ...books.map(b => tx.store.put(b)),
      tx.done
    ])
  }

  /** Return one cached book by id, or null. */
  async getBook(id) {
    const db = await getDB()
    return (await db.get('books', id)) ?? null
  }

  /** Upsert a single book into the cache. */
  async putBook(book) {
    const db = await getDB()
    await db.put('books', book)
  }

  /** Remove a book from the cache. */
  async deleteBook(id) {
    const db = await getDB()
    await db.delete('books', id)
  }

  // ─── SERIES ──────────────────────────────────────────────────────────────

  /** Return all cached series. */
  async getSeries() {
    const db = await getDB()
    return db.getAll('series')
  }

  /** Replace the entire series cache. */
  async putAllSeries(seriesArray) {
    const db = await getDB()
    const tx = db.transaction('series', 'readwrite')
    await Promise.all([
      ...seriesArray.map(s => tx.store.put(s)),
      tx.done
    ])
  }

  /** Return one cached series by id, or null. */
  async getSeriesById(id) {
    const db = await getDB()
    return (await db.get('series', id)) ?? null
  }

  /** Upsert a single series document. */
  async putSeriesById(series) {
    const db = await getDB()
    await db.put('series', series)
  }

  // ─── PROGRESS ─────────────────────────────────────────────────────────────

  /** Composite key used for all progress lookups. */
  _progressKey(userId, bookId) {
    return `${userId}_${bookId}`
  }

  /** Return the cached progress record for a user+book pair, or null. */
  async getProgress(userId, bookId) {
    const db = await getDB()
    return (await db.get('progress', this._progressKey(userId, bookId))) ?? null
  }

  /**
   * Upsert the progress record.
   * Merges with any existing local record so we never lose fields.
   */
  async putProgress(userId, bookId, data) {
    const db = await getDB()
    const key = this._progressKey(userId, bookId)
    const existing = (await db.get('progress', key)) ?? {}
    await db.put('progress', {
      ...existing,
      ...data,
      id: key,
      userId,
      bookId
    })
  }

  /** Return all progress records for a user (sorted by updatedAt desc). */
  async getAllProgressForUser(userId) {
    const db = await getDB()
    const all = await db.getAllFromIndex('progress', 'userId', userId)
    return all.sort(
      (a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0)
    )
  }

  // ─── SETTINGS ─────────────────────────────────────────────────────────────

  /** Return cached settings for a user, or null. */
  async getSettings(userId) {
    const db = await getDB()
    return (await db.get('settings', userId)) ?? null
  }

  /** Upsert user settings. */
  async putSettings(userId, data) {
    const db = await getDB()
    const existing = (await db.get('settings', userId)) ?? {}
    await db.put('settings', { ...existing, ...data, userId })
  }

  // ─── SYNC QUEUE ───────────────────────────────────────────────────────────

  /**
   * Add an item to the offline write queue.
   *
   * @param {{ collection: string, docId: string, payload: object }} item
   */
  async enqueueWrite({ collection, docId, payload }) {
    const db = await getDB()
    await db.add('syncQueue', {
      collection,
      docId,
      payload,
      retries: 0,
      createdAt: new Date().toISOString()
    })
  }

  /** Return all queued write items, ordered by insertion (ascending id). */
  async dequeueAll() {
    const db = await getDB()
    return db.getAll('syncQueue')
  }

  /** Update retry count for a queued item. */
  async incrementRetry(queueItemId) {
    const db = await getDB()
    const item = await db.get('syncQueue', queueItemId)
    if (item) {
      await db.put('syncQueue', { ...item, retries: (item.retries ?? 0) + 1 })
    }
  }

  /** Remove a successfully synced item from the queue. */
  async removeQueueItem(queueItemId) {
    const db = await getDB()
    await db.delete('syncQueue', queueItemId)
  }

  /** Clear the entire sync queue (e.g. after a full flush). */
  async clearQueue() {
    const db = await getDB()
    await db.clear('syncQueue')
  }

  /** Return the number of pending items in the sync queue. */
  async queueSize() {
    const db = await getDB()
    return db.count('syncQueue')
  }
}

export default new LocalPersistenceService()
