import firestore from '../services/FirestoreService'

class SettingsRepository {
  constructor(fs = firestore) {
    this.fs = fs
  }

  get(userId) {
    return this.fs.getDocByPath('settings', userId)
  }

  set(userId, data) {
    return this.fs.set('settings', userId, { userId, ...data })
  }
}

export default new SettingsRepository()
