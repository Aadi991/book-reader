import firestore from '../application/FirestoreService'

class ProgressRepository {
  constructor(fs = firestore) {
    this.fs = fs
  }

  async getProgress(userId, bookId) {
    const id = `${userId}_${bookId}`

    return await this.fs.getDocByPath('progress', id)
  }

  async setProgress(userId, bookId, data) {
    const id = `${userId}_${bookId}`

    const payload = {
      userId,
      bookId,
      ...data
    }

    return await this.fs.set('progress', id, payload)
  }

  /**
   * FIXED: actually returns user history
   */
  async listForUser(userId) {
    const all = await this.fs.query('progress', [])

    console.log('[all progress]', all)

    const filtered = (all || [])
      .filter(p => p.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
      )

    console.log('[filtered progress]', filtered)

    return filtered
  }

  /**
   * NEW: clean API for dashboard
   */
  async getRecentlyOpened(userId, limit = 1) {
    const list = await this.listForUser(userId)
    return list.slice(0, limit)
  }
}

export default new ProgressRepository()