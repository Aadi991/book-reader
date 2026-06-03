import firestore from '../services/FirestoreService'

class ProgressRepository {
  constructor(fs = firestore) {
    this.fs = fs
  }

  // document id will be `${userId}_${bookId}`
  async getProgress(userId, bookId) {
    const id = `${userId}_${bookId}`
    return this.fs.getDocByPath('progress', id)
  }

  async setProgress(userId, bookId, data) {
    const id = `${userId}_${bookId}`
    return this.fs.set('progress', id, { userId, bookId, ...data })
  }

  async listForUser(userId) {
    return this.fs.query('progress', [])
  }
}

export default new ProgressRepository()
