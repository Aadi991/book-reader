import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query as firestoreQuery,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { app } from './firebase'

class FirestoreService {
  constructor() {
    this.db = getFirestore(app)
  }

  collection(name) {
    return collection(this.db, name)
  }

  doc(collectionPath, id) {
    return doc(this.db, collectionPath, id)
  }

  async getDocByPath(collectionPath, id) {
    const d = await getDoc(this.doc(collectionPath, id))
    return d.exists() ? { id: d.id, ...d.data() } : null
  }

  // constraints is an array of Firestore where/orderBy constraints
  async query(collectionPath, constraints = []) {
    const col = this.collection(collectionPath)
    const q = constraints && constraints.length ? firestoreQuery(col, ...constraints) : col
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }

  async add(collectionPath, data) {
    return addDoc(this.collection(collectionPath), data)
  }

  async set(collectionPath, id, data) {
    return setDoc(this.doc(collectionPath, id), data)
  }

  async update(collectionPath, id, data) {
    return updateDoc(this.doc(collectionPath, id), data)
  }

  async delete(collectionPath, id) {
    return deleteDoc(this.doc(collectionPath, id))
  }
}

export default new FirestoreService()
