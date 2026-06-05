import { useEffect, useState } from 'react'
import BookRepository from '../data/BookRepository'
import SeriesRepository from '../data/SeriesRepository'
import client from '../application/supabaseClient'

export default function useLibrary() {
  const [books, setBooks] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[useLibrary] mounted')
    load()
  }, [])

  // 🔐 Signed URL (valid for 1 day)
  async function getSignedUrl(bucket, path) {
    if (!bucket || !path) {
      console.warn('[useLibrary] Missing bucket/path', { bucket, path })
      return null
    }

    const cleanPath = path.replace(/^public\//, '')

    const { data, error } = await client
      .storage
      .from(bucket)
      .createSignedUrl(cleanPath, 60 * 60 * 24) // 24 hours

    if (error) {
      console.error('[useLibrary] signed URL error:', error)
      return null
    }

    console.log('[useLibrary] signed URL:', data.signedUrl)

    return data.signedUrl
  }

  async function load() {
    console.log('[useLibrary] load() called')
    setLoading(true)

    try {
      const [booksData, seriesData] = await Promise.all([
        BookRepository.getAllBooks(),
        SeriesRepository.getAllSeries()
      ])

      console.log('[useLibrary] raw books:', booksData)
      console.log('[useLibrary] raw series:', seriesData)

      // ✅ IMPORTANT: async mapping
      const standaloneBooks = await Promise.all(
        (booksData || []).map(async (book) => ({
          ...book,
          type: 'book',
          coverUrl: await getSignedUrl(
            book.coverBucket || 'Covers',
            book.coverPath
          )
        }))
      )

      const seriesItems = await Promise.all(
        (seriesData || []).map(async (item) => ({
          ...item,
          type: 'series',
          coverUrl: await getSignedUrl(
            item.coverBucket || 'Covers',
            item.coverPath
          )
        }))
      )

      console.log('[useLibrary] final books:', standaloneBooks)
      console.log('[useLibrary] final series:', seriesItems)

      setBooks(standaloneBooks)
      setSeries(seriesItems)

    } catch (err) {
      console.error('[useLibrary] ERROR:', err)
    } finally {
      setLoading(false)
      console.log('[useLibrary] loading complete')
    }
  }

  return {
    books,
    series,
    loading,
    reload: load
  }
}