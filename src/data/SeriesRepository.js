/**
 * SeriesRepository.js
 *
 * Cache-first repository for Series and their nested Volumes.
 * Unified as an instance class (was previously a mix of static + import styles).
 *
 * Read strategy:
 *   1. IndexedDB (LocalPersistenceService) — instant, offline-safe
 *   2. Firestore on cache miss → populate cache
 *
 * Write strategy:
 *   - Writes go to Firestore (admin operations, always online)
 *   - Cache is updated/populated after writes
 */

import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc
} from 'firebase/firestore'

import { db } from '../application/firebase'
import StorageService from './StorageService'
import LocalPersistenceService from './persistence/LocalPersistenceService'

class SeriesRepository {
  // ─── READ ─────────────────────────────────────────────────────────────────

  /**
   * Return a single series with all volumes (including coverUrls).
   * Cache-first; hydrates cover URLs on Firestore fetch.
   */
  async get(seriesId) {
    // 1. Try local cache
    const cached = await LocalPersistenceService.getSeriesById(seriesId)
    if (cached) return cached

    // 2. Firestore miss — fetch and populate cache
    try {
      const seriesRef = doc(db, 'Series', seriesId)
      const seriesSnap = await getDoc(seriesRef)

      if (!seriesSnap.exists()) return null

      const volumesSnap = await getDocs(
        collection(db, 'Series', seriesId, 'volumes')
      )

      const volumes = await Promise.all(
        volumesSnap.docs.map(async volumeDoc => {
          const data = volumeDoc.data()
          let coverUrl = null

          try {
            if (data.coverPath) {
              coverUrl = await StorageService.getCoverUrl(data.coverPath)
            }
          } catch (err) {
            console.error('[SeriesRepository] Failed loading cover', err)
          }

          return { id: volumeDoc.id, ...data, coverUrl }
        })
      )

      volumes.sort(
        (a, b) => Number(a.volumeNo || 0) - Number(b.volumeNo || 0)
      )

      const series = {
        id: seriesSnap.id,
        ...seriesSnap.data(),
        volumes
      }

      await LocalPersistenceService.putSeriesById(series)
      return series
    } catch (err) {
      console.warn('[SeriesRepository] Firestore unavailable for get():', err)
      return null
    }
  }

  /**
   * Return all series with their volumes.
   * Cache-first; cover URLs are only resolved on Firestore fetch.
   */
  async getAllSeries() {
    const cached = await LocalPersistenceService.getSeries()
    if (cached && cached.length > 0) return cached

    return this._fetchAllFromFirestore()
  }

  // ─── WRITE ────────────────────────────────────────────────────────────────

  async createSeries(series) {
    const ref = await addDoc(collection(db, 'Series'), series)
    await LocalPersistenceService.putSeriesById({ id: ref.id, ...series, volumes: [] })
    return ref.id
  }

  async addVolume(seriesId, volumeId, volume) {
    await setDoc(
      doc(db, 'Series', seriesId, 'volumes', volumeId),
      volume
    )

    // Invalidate the cached series so next get() re-fetches with new volume
    const existing = await LocalPersistenceService.getSeriesById(seriesId)
    if (existing) {
      const volumes = existing.volumes ?? []
      const updated = {
        ...existing,
        volumes: [
          ...volumes.filter(v => v.id !== volumeId),
          { id: volumeId, ...volume }
        ].sort((a, b) => Number(a.volumeNo || 0) - Number(b.volumeNo || 0))
      }
      await LocalPersistenceService.putSeriesById(updated)
    }
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────────────

  async _fetchAllFromFirestore() {
    try {
      const snapshot = await getDocs(collection(db, 'Series'))

      const allSeries = await Promise.all(
        snapshot.docs.map(async seriesDoc => {
          const seriesId = seriesDoc.id

          const volumesSnap = await getDocs(
            collection(db, 'Series', seriesId, 'volumes')
          )

          const volumes = volumesSnap.docs
            .map(volumeDoc => ({ id: volumeDoc.id, ...volumeDoc.data() }))
            .sort(
              (a, b) => Number(a.volumeNo || 0) - Number(b.volumeNo || 0)
            )

          return { id: seriesId, ...seriesDoc.data(), volumes }
        })
      )

      await LocalPersistenceService.putAllSeries(allSeries)
      return allSeries
    } catch (err) {
      console.warn('[SeriesRepository] Firestore unavailable for getAllSeries():', err)
      return []
    }
  }
}

// Export as both a singleton instance and the class for static-style call-sites
const instance = new SeriesRepository()
export default instance