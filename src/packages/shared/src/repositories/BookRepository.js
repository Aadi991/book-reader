import firestore from '../services/FirestoreService'
import storage from '../services/StorageService'
import { where } from 'firebase/firestore'

class BookRepository {
  constructor(fs = firestore, storageService = storage) {
    this.fs = fs
    this.storage = storageService
  }

  listByUser(userId) {
    return this.fs.query('books', [where('ownerId', '==', userId)])
  }

  get(id) {
    return this.fs.getDocByPath('books', id)
  }

  add(book) {
    return this.fs.add('books', book)
  }

  update(id, book) {
    return this.fs.update('books', id, book)
  }

  delete(id) {
    return this.fs.delete('books', id)
  }

  // Resolve a usable URL for the book file or cover.
  // Tries common fields on the book document, then falls back to a predictable path.
  async getFileUrlForBook(book, { bucket = 'Books', expirySec = 60 } = {}) {
    if (!book) return null

    // prefer explicit file fields
    const path = book.filePath || book.storagePath || book.pdfPath || book.path
    const coverPath = book.coverPath || book.coverUrl

    try {
      // If book specifies a separate coverBucket, use it.
      if (coverPath) {
        const coverBucket = book.coverBucket || bucket
        return await this.storage.getBookUrl(coverBucket, coverPath, expirySec)
      }

      if (path) {
        return await this.storage.getBookUrl(bucket, path, expirySec)
      }

      // fallback: attempt ownerId/id.pdf
      if (book.ownerId && book.id) {
        const fallback = `${book.ownerId}/${book.id}.pdf`
        return await this.storage.getBookUrl(bucket, fallback, expirySec)
      }
    } catch (e) {
      console.error('Failed to get file url for book', e)
      return null
    }
    return null
  }

  // Download the book via storage service and return blob
  async downloadBookFile(book, { bucket = 'Books', fileName } = {}) {
    const path = book.filePath || book.storagePath || book.pdfPath || `${book.ownerId}/${book.id}.pdf`
    if (!path) throw new Error('No file path available for book')
    return this.storage.downloadBook(bucket, path, { fileName: fileName || `${book.id || 'book'}.pdf` })
  }
}

export default new BookRepository()
