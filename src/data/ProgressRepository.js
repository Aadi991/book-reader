import firestore from '../application/FirestoreService'

class ProgressRepository {
  constructor(fs = firestore) {
    this.fs = fs
  }

  // document id will be `${userId}_${bookId}`
  async getProgress(userId, bookId) {
    const id = `${userId}_${bookId}`

    console.log(
      '[ProgressRepository] getProgress',
      {
        id,
        userId,
        bookId
      }
    )

    const result =
      await this.fs.getDocByPath(
        'progress',
        id
      )

    console.log(
      '[ProgressRepository] getProgress result',
      result
    )

    return result
  }

  async setProgress(userId, bookId, data) {
    const id = `${userId}_${bookId}`

    const payload = {
      userId,
      bookId,
      ...data
    }

    console.log(
      '[ProgressRepository] setProgress',
      {
        collection: 'progress',
        id,
        payload
      }
    )

    const result =
      await this.fs.set(
        'progress',
        id,
        payload
      )

    console.log(
      '[ProgressRepository] setProgress result',
      result
    )

    return result
  }

  async listForUser(userId) {
    return this.fs.query('progress', [])
  }
}

export default new ProgressRepository()
