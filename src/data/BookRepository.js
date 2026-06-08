/**
 * BookRepository.js
 *
 * Firebase-first repository for book metadata.
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
 *   - Writes go to Firestore and invalidate / update the local cache entry
 *   - Books are read-heavy and managed by the owner, so offline writes
 *     are not queued (the uploader is always online)
 */

import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

import firestore from '../application/FirestoreService'
import storage from './StorageService'
import LocalPersistenceService from './persistence/LocalPersistenceService'

class BookRepository {
  constructor(fs = firestore, storageService = storage) {
    this.db = fs.db
    this.storage = storageService
    this._cachePopulated = false
  }

  // ─── READ ─────────────────────────────────────────────────────────────────

  /**
   * Return all books.
   * Always tries Firestore first; falls back to IndexedDB on any error.
   * navigator.onLine is intentionally NOT used — unreliable in Android WebViews.
   */
  async getAllBooks() {
    try {
      return await this._fetchAllFromFirestore()
    } catch (err) {
      console.warn('[BookRepository] Firestore unavailable — using cache:', err)
    }

    const cached = await LocalPersistenceService.getBooks()
    return cached ?? []
  }

  /** Return books by owner — cache first, filtered from full cache. */
  async listByUser(userId) {
    // Ensure cache is warm
    const all = await this.getAllBooks()
    return all.filter(b => b.ownerId === userId)
  }

  /**
   * Return one book by id.
   * Always tries Firestore first; falls back to IndexedDB on any error.
   * navigator.onLine is intentionally NOT used — unreliable in Android WebViews.
   */
  async get(id) {
    try {
      const snapshot = await getDoc(doc(this.db, 'books', id))
      if (!snapshot.exists()) return null

      const book = { id: snapshot.id, ...snapshot.data() }
      await LocalPersistenceService.putBook(book)
      return book
    } catch (err) {
      console.warn('[BookRepository] Firestore unavailable — using cache:', err)
    }

    return await LocalPersistenceService.getBook(id)
  }

  // ─── WRITE ────────────────────────────────────────────────────────────────

  async add(book) {
    const ref = await addDoc(collection(this.db, 'books'), book)
    const newBook = { id: ref.id, ...book }
    await LocalPersistenceService.putBook(newBook)
    return ref.id
  }

  async update(id, book) {
    await updateDoc(doc(this.db, 'books', id), book)
    // Merge into cache
    const existing = await LocalPersistenceService.getBook(id)
    await LocalPersistenceService.putBook({ ...(existing ?? {}), ...book, id })
  }

  async delete(id) {
    await deleteDoc(doc(this.db, 'books', id))
    await LocalPersistenceService.deleteBook(id)
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────────────

  async _fetchAllFromFirestore() {
    const snapshot = await getDocs(collection(this.db, 'books'))
    const books = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    await LocalPersistenceService.putBooks(books)
    return books
  }
}

export default new BookRepository()