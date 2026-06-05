import { useEffect, useState } from 'react'
import StorageService from './StorageService'

export default function useBookUrl(volume) {
  const [bookUrl, setBookUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!volume?.storagePath) {
      setBookUrl(null)
      return
    }

    async function loadBookUrl() {
      try {
        setLoading(true)
        setError(null)

        const url =
          await StorageService.getBookUrl(
            'Books',
            volume.storagePath
          )

        setBookUrl(url)
      } catch (err) {
        console.error(
          '[useBookUrl] Failed to load URL',
          err
        )

        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadBookUrl()
  }, [volume])

  return {
    bookUrl,
    loading,
    error
  }
}