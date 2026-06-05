import {
  useCallback,
  useEffect,
  useState
} from 'react'

import ProgressRepository from '../data/ProgressRepository'

export default function useReadingHistory({
  userId,
  bookId
}) {
  console.log(
    '[useReadingHistory] init',
    {
      userId,
      bookId
    }
  )

  const [progress, setProgress] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(null)

  const loadProgress =
    useCallback(async () => {
      console.log(
        '[useReadingHistory] loadProgress start',
        {
          userId,
          bookId
        }
      )

      if (!userId || !bookId) {
        console.warn(
          '[useReadingHistory] Missing userId/bookId'
        )

        setProgress(null)
        setLoading(false)

        return
      }

      try {
        setLoading(true)
        setError(null)

        const data =
          await ProgressRepository.getProgress(
            userId,
            bookId
          )

        console.log(
          '[useReadingHistory] Progress loaded',
          data
        )

        setProgress(data || null)
      } catch (err) {
        console.error(
          '[useReadingHistory] Failed to load progress',
          err
        )

        setError(err)
      } finally {
        setLoading(false)

        console.log(
          '[useReadingHistory] loadProgress finished'
        )
      }
    }, [userId, bookId])

  /**
   * Load reading progress automatically
   * when userId or bookId changes.
   */
  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  const saveReadingHistory =
    useCallback(
      async ({
        page,
        volumeId = null,
        volumeNo = null
      }) => {
        console.log(
          '[useReadingHistory] saveReadingHistory called',
          {
            userId,
            bookId,
            page,
            volumeId,
            volumeNo
          }
        )

        if (!userId || !bookId) {
          console.warn(
            '[useReadingHistory] Missing userId/bookId, aborting save'
          )

          return
        }

        try {
          const payload = {
            page,
            updatedAt:
              new Date().toISOString()
          }

          if (volumeId) {
            payload.volumeId =
              volumeId

            payload.volumeNo =
              volumeNo
          }

          console.log(
            '[useReadingHistory] Saving payload',
            payload
          )

          await ProgressRepository.setProgress(
            userId,
            bookId,
            payload
          )

          console.log(
            '[useReadingHistory] Save successful'
          )

          setProgress(prev => ({
            ...(prev || {}),
            ...payload
          }))
        } catch (err) {
          console.error(
            '[useReadingHistory] Failed to save progress',
            err
          )

          throw err
        }
      },
      [userId, bookId]
    )

  return {
    progress,
    loading,
    error,
    reload: loadProgress,
    saveReadingHistory
  }
}