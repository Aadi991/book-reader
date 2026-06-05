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
import storage from '../application/StorageService'

class BookRepository {
  constructor(fs = firestore, storageService = storage) {
    this.db = fs.db
    this.storage = storageService
  }

  async getAllBooks() {
    const snapshot = await getDocs(
      collection(this.db, 'books')
    )

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  async listByUser(userId) {
    const q = query(
      collection(this.db, 'books'),
      where('ownerId', '==', userId)
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  async get(id) {
    const snapshot = await getDoc(
      doc(this.db, 'books', id)
    )

    if (!snapshot.exists()) return null

    return {
      id: snapshot.id,
      ...snapshot.data()
    }
  }

  async add(book) {
    const ref = await addDoc(
      collection(this.db, 'books'),
      book
    )

    return ref.id
  }

  async update(id, book) {
    await updateDoc(
      doc(this.db, 'books', id),
      book
    )
  }

  async delete(id) {
    await deleteDoc(
      doc(this.db, 'books', id)
    )
  }
}

export default new BookRepository()