import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc
} from 'firebase/firestore'

import { db } from '../application/firebase'
import StorageService from '../application/StorageService'

class SeriesRepository {
  static async createSeries(series) {
    const ref = await addDoc(
      collection(db, 'Series'),
      series
    )

    return ref.id
  }

  static async get(seriesId) {
    try {
      const seriesRef = doc(
        db,
        'Series',
        seriesId
      )

      const seriesSnap =
        await getDoc(seriesRef)

      if (!seriesSnap.exists()) {
        return null
      }

      const volumesSnap =
        await getDocs(
          collection(
            db,
            'Series',
            seriesId,
            'volumes'
          )
        )

      const volumes =
        await Promise.all(
          volumesSnap.docs.map(
            async volumeDoc => {
              const data =
                volumeDoc.data()

              let coverUrl = null

              try {
                if (data.coverPath) {
                  coverUrl =
                    await StorageService.getCoverUrl(
                      data.coverPath
                    )
                }
              } catch (err) {
                console.error(
                  'Failed loading cover',
                  err
                )
              }

              return {
                id: volumeDoc.id,
                ...data,
                coverUrl
              }
            }
          )
        )

      volumes.sort(
        (a, b) =>
          Number(a.volumeNo || 0) -
          Number(b.volumeNo || 0)
      )

      return {
        id: seriesSnap.id,
        ...seriesSnap.data(),
        volumes
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  static async addVolume(
    seriesId,
    volumeId,
    volume
  ) {
    await setDoc(
      doc(
        db,
        'Series',
        seriesId,
        'volumes',
        volumeId
      ),
      volume
    )
  }

  static async getAllSeries() {
    const snapshot =
      await getDocs(
        collection(db, 'Series')
      )

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }
}

export default SeriesRepository