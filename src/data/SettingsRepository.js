/**
 * SettingsRepository.js
 *
 * Firebase-first repository for user settings.
 *
 * Read strategy:
 *   1. Always attempt Firestore first (authoritative, cross-device)
 *   2. Fall back to IndexedDB only on network / Firestore error
 *
 * NOTE: navigator.onLine is NOT used as a read gate because it is
 * unreliable inside Android Capacitor WebViews and can return false
 * even when the network is available, causing stale data to be served.
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

  /**
   * Return settings for a user.
   * Always tries Firestore first; falls back to IndexedDB on any error.
   * navigator.onLine is intentionally NOT used here — it is unreliable
   * inside Android Capacitor WebViews.
   */
  async get(userId) {
    try {
      const remote = await this.fs.getDocByPath(COLLECTION, userId)
      if (remote) {
        await LocalPersistenceService.putSettings(userId, remote)
      }
      return remote
    } catch (err) {
      console.warn('[SettingsRepository] Firestore unavailable — using local cache:', err)
    }

    return await LocalPersistenceService.getSettings(userId)
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
