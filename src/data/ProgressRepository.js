/**
 * ProgressRepository.js
 *
 * Offline-first repository for reading progress.
 *
 * This is the most critical repository for offline support.
 *
 * Read strategy:
 *   1. Always read from IndexedDB (LocalPersistenceService) — instant, offline-safe
 *   2. On first load with an empty local record → hydrate from Firestore
 *
 * Write strategy (setProgress):
 *   1. ALWAYS write to IndexedDB immediately (user never loses progress)
 *   2a. If online  → also write to Firestore directly
 *   2b. If offline → enqueue to syncQueue (OfflineSyncService replays on reconnect)
 *
 * This clearly separates:
 *   - Object persistence   = IndexedDB (LocalPersistenceService) — always available
 *   - Firestore persistence = network write / queued replay — cross-device sync
 */

import firestore from '../application/FirestoreService'
import LocalPersistenceService from './persistence/LocalPersistenceService'
import OfflineSyncService from './persistence/OfflineSyncService'

const COLLECTION = 'progress'

class ProgressRepository {
  constructor(fs = firestore) {
    this.fs = fs
  }

  // ─── READ ─────────────────────────────────────────────────────────────────

  /**
   * Get reading progress for a user+book pair.
   * Returns local data immediately; hydrates from Firestore on first miss.
   */
  async getProgress(userId, bookId) {
    // 1. Try local cache first
    const local = await LocalPersistenceService.getProgress(userId, bookId)
    if (local) return local

    // 2. Cache miss — fetch from Firestore and populate local
    try {
      const id = `${userId}_${bookId}`
      const remote = await this.fs.getDocByPath(COLLECTION, id)
      if (remote) {
        await LocalPersistenceService.putProgress(userId, bookId, remote)
      }
      return remote
    } catch (err) {
      console.warn('[ProgressRepository] Firestore unavailable for getProgress:', err)
      return null
    }
  }

  /**
   * Save reading progress.
   *
   * Step 1: Write to IndexedDB immediately (always, offline-safe).
   * Step 2a: Online  → write to Firestore.
   * Step 2b: Offline → enqueue for later replay.
   */
  async setProgress(userId, bookId, data) {
    const id = `${userId}_${bookId}`

    const payload = {
      id,
      userId,
      bookId,
      ...data
    }

    // ── Step 1: Local persistence (IndexedDB) — always ──
    await LocalPersistenceService.putProgress(userId, bookId, payload)

    // ── Step 2: Firestore persistence — conditional on network ──
    if (navigator.onLine) {
      try {
        await this.fs.set(COLLECTION, id, payload)
        console.log('[ProgressRepository] Synced to Firestore:', id)
      } catch (err) {
        console.warn(
          '[ProgressRepository] Firestore write failed — queueing for retry:',
          err
        )
        // Network error mid-online state — queue as fallback
        await OfflineSyncService.enqueueWrite({
          collection: COLLECTION,
          docId: id,
          payload
        })
      }
    } else {
      // Offline — queue for later sync
      await OfflineSyncService.enqueueWrite({
        collection: COLLECTION,
        docId: id,
        payload
      })
      console.log('[ProgressRepository] Offline — progress queued for sync:', id)
    }
  }

  // ─── LIST ─────────────────────────────────────────────────────────────────

  /**
   * List all progress records for a user, sorted by most recently updated.
   * Reads from IndexedDB — no full-collection Firestore scan.
   */
  async listForUser(userId) {
    const local = await LocalPersistenceService.getAllProgressForUser(userId)

    // If we have local data, return it immediately
    if (local && local.length > 0) {
      return local
    }

    // Cold start — hydrate from Firestore (uses the old query, one-time cost)
    try {
      const all = await this.fs.query(COLLECTION, [])
      const filtered = (all ?? [])
        .filter(p => p.userId === userId)
        .sort(
          (a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0)
        )

      // Populate local cache
      for (const item of filtered) {
        await LocalPersistenceService.putProgress(userId, item.bookId, item)
      }

      return filtered
    } catch (err) {
      console.warn('[ProgressRepository] Firestore unavailable for listForUser:', err)
      return []
    }
  }

  /**
   * Return the most recently read items for a user.
   * @param {string} userId
   * @param {number} limit
   */
  async getRecentlyOpened(userId, limit = 1) {
    const list = await this.listForUser(userId)
    return list.slice(0, limit)
  }
}

export default new ProgressRepository()