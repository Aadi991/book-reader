/**
 * OfflineSyncService.js
 *
 * Watches network connectivity and replays queued Firestore writes
 * when the connection is restored.
 *
 * Differentiation:
 *   - Object persistence  → LocalPersistenceService (IndexedDB, always available)
 *   - Firestore persistence → this service (network-dependent, source of truth)
 *
 * Flow:
 *   1. Repositories call enqueueWrite() when offline
 *   2. OfflineSyncService listens for `window.online` events
 *   3. On reconnect → flush() drains the queue item-by-item via FirestoreService
 *   4. Failed items are retried up to MAX_RETRIES with exponential back-off
 *   5. Items exceeding MAX_RETRIES are removed to prevent infinite growth
 */

import FirestoreService from '../../application/FirestoreService'
import LocalPersistenceService from './LocalPersistenceService'

const MAX_RETRIES = 5
const BASE_BACKOFF_MS = 2000

class OfflineSyncService {
  constructor() {
    this._flushing = false
    this._retryTimer = null
    this._listeners = []
  }

  /**
   * Start listening for online events and do an initial flush
   * in case we are already online with pending items.
   */
  startListening() {
    const onOnline = () => {
      console.log('[OfflineSyncService] Network restored — flushing queue')
      this.flush()
    }

    window.addEventListener('online', onOnline)
    this._listeners.push({ event: 'online', handler: onOnline })

    // Flush immediately in case items were queued before this service started
    if (navigator.onLine) {
      this.flush()
    }
  }

  /** Remove all event listeners (call on app unmount / cleanup). */
  stopListening() {
    this._listeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler)
    })
    this._listeners = []
    if (this._retryTimer) {
      clearTimeout(this._retryTimer)
      this._retryTimer = null
    }
  }

  /**
   * Drain the sync queue. Each item is written to Firestore.
   * Successful items are removed. Failed items are retried or
   * discarded once MAX_RETRIES is exceeded.
   */
  async flush() {
    if (this._flushing) return
    if (!navigator.onLine) return

    this._flushing = true

    try {
      const items = await LocalPersistenceService.dequeueAll()

      if (items.length === 0) {
        return
      }

      console.log(`[OfflineSyncService] Flushing ${items.length} queued write(s)`)

      for (const item of items) {
        try {
          await FirestoreService.set(item.collection, item.docId, item.payload)
          await LocalPersistenceService.removeQueueItem(item.id)
          console.log(`[OfflineSyncService] Synced: ${item.collection}/${item.docId}`)
        } catch (err) {
          console.warn(
            `[OfflineSyncService] Failed to sync ${item.collection}/${item.docId}`,
            err
          )

          if ((item.retries ?? 0) >= MAX_RETRIES) {
            console.error(
              `[OfflineSyncService] Max retries reached for ${item.collection}/${item.docId} — discarding`
            )
            await LocalPersistenceService.removeQueueItem(item.id)
          } else {
            await LocalPersistenceService.incrementRetry(item.id)
            // Schedule a retry with exponential back-off
            const delay = BASE_BACKOFF_MS * Math.pow(2, item.retries ?? 0)
            console.log(`[OfflineSyncService] Retrying in ${delay}ms`)
            this._retryTimer = setTimeout(() => this.flush(), delay)
          }
        }
      }
    } finally {
      this._flushing = false
    }
  }

  /**
   * Convenience: enqueue a write through the service.
   * Repositories can call this directly.
   *
   * @param {{ collection: string, docId: string, payload: object }} opts
   */
  async enqueueWrite({ collection, docId, payload }) {
    await LocalPersistenceService.enqueueWrite({ collection, docId, payload })
    console.log(`[OfflineSyncService] Queued write: ${collection}/${docId}`)
  }

  /** Return the number of pending writes in the queue. */
  async pendingCount() {
    return LocalPersistenceService.queueSize()
  }
}

export default new OfflineSyncService()
