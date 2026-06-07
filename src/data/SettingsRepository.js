/**
 * SettingsRepository.js
 *
 * Cache-first repository for user settings.
 *
 * Read strategy:
 *   1. IndexedDB (LocalPersistenceService) — instant, offline-safe
 *   2. Firestore on cache miss
 *
 * Write strategy:
 *   - Online  → IndexedDB + Firestore
 *   - Offline → IndexedDB + OfflineSyncService queue
 */

import firestore from '../application/FirestoreService'
import LocalPersistenceService from './persistence/LocalPersistenceService'
import OfflineSyncService from './persistence/OfflineSyncService'

const COLLECTION = 'settings'

class SettingsRepository {
  constructor(fs = firestore) {
    this.fs = fs
  }

  /** Return settings for a user — IndexedDB first, Firestore fallback. */
  async get(userId) {
    const cached = await LocalPersistenceService.getSettings(userId)
    if (cached) return cached

    try {
      const remote = await this.fs.getDocByPath(COLLECTION, userId)
      if (remote) {
        await LocalPersistenceService.putSettings(userId, remote)
      }
      return remote
    } catch (err) {
      console.warn('[SettingsRepository] Firestore unavailable for get():', err)
      return null
    }
  }

  /**
   * Save settings.
   * Writes to IndexedDB always; then Firestore if online, queue if offline.
   */
  async set(userId, data) {
    const payload = { userId, ...data }

    // Always write locally
    await LocalPersistenceService.putSettings(userId, payload)

    if (navigator.onLine) {
      try {
        await this.fs.set(COLLECTION, userId, payload)
      } catch (err) {
        console.warn('[SettingsRepository] Firestore write failed — queueing:', err)
        await OfflineSyncService.enqueueWrite({
          collection: COLLECTION,
          docId: userId,
          payload
        })
      }
    } else {
      await OfflineSyncService.enqueueWrite({
        collection: COLLECTION,
        docId: userId,
        payload
      })
    }
  }
}

export default new SettingsRepository()
