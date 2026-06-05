import { useEffect, useState } from 'react'

import BookRepository from '../data/BookRepository'
import SeriesRepository from '../data/SeriesRepository'
import ProgressRepository from '../data/ProgressRepository'

import client from '../application/supabaseClient'

export default function useRecentlyOpened(
  userId
) {
    console.log('dashboard userId', userId)
  const [
    featuredItem,
    setFeaturedItem
  ] = useState(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    load()
  }, [userId])

  async function getSignedUrl(path) {
    if (!path) return null

    const { data } =
      await client.storage
        .from('Covers')
        .createSignedUrl(
          path,
          60 * 60 * 24
        )

    return data?.signedUrl ?? null
  }

  async function load() {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const [recent] =
        await ProgressRepository.getRecentlyOpened(
          userId,
          1
        )

      console.log('[recent]', recent)

      if (!recent) {
        setFeaturedItem(null)
        return
      }

      const book =
        await BookRepository.get(
          recent.bookId
        )

        console.log(
        '[book lookup]',
        recent.bookId,
        book
        )

      if (book) {
        const coverUrl =
          await getSignedUrl(
            book.coverPath
          )
          console.log(
            '[cover url]',
            coverUrl
            )

        setFeaturedItem({
          id: book.id,

          type: 'book',

          title: book.title,

          author:
            book.author ?? '',

          coverUrl,

          currentPage:
            recent.page ?? 0,

          progress:
            book.pageCount
              ? Math.round(
                  (recent.page /
                    book.pageCount) *
                    100
                )
              : 0
        })

        console.log(
        '[featured item]',
        {
            id: book.id,
            title: book.title,
            coverUrl
        }
        )

        return
      }

      const series =
        await SeriesRepository.get(
          recent.bookId
        )

        console.log(
        '[series lookup]',
        recent.bookId,
        series
        )

      if (!series) {
        setFeaturedItem(null)
        return
      }

      const volume =
        series.volumes.find(
          v =>
            v.id ===
            recent.volumeId
        ) ??
        series.volumes[0]

      const coverUrl =
        await getSignedUrl(
          volume?.coverPath
        )

      const pageCount =
        volume?.pageCount ?? 0

      setFeaturedItem({
        id: series.id,

        type: 'series',

        title: series.name,

        author: '',

        coverUrl,

        currentPage:
          recent.page ?? 0,

        progress:
          pageCount > 0
            ? Math.round(
                (recent.page /
                  pageCount) *
                  100
              )
            : 0,

        volumeNo:
          volume?.volumeNo
      })
    } catch (error) {
      console.error(error)
      setFeaturedItem(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    featuredItem,
    loading
  }
}