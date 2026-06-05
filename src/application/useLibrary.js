import { useEffect, useState } from 'react'

import BookRepository from '../data/BookRepository'
import SeriesRepository from '../data/SeriesRepository'
import ProgressRepository from '../data/ProgressRepository'

import client from '../application/supabaseClient'

export default function useLibrary(userId) {
  const [books, setBooks] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [userId])

  async function getSignedUrl(bucket, path) {
    if (!bucket || !path) {
      return null
    }

    const { data, error } =
      await client.storage
        .from(bucket)
        .createSignedUrl(
          path.replace(/^public\//, ''),
          60 * 60 * 24
        )

    if (error) {
      console.error(error)
      return null
    }

    return data?.signedUrl ?? null
  }

  async function load() {
    setLoading(true)

    try {
      const [
        booksData,
        seriesData,
        progress
      ] = await Promise.all([
        BookRepository.getAllBooks(),
        SeriesRepository.getAllSeries(),
        userId
          ? ProgressRepository.listForUser(
              userId
            )
          : []
      ])

      const latestProgress =
        new Map()

      for (const item of progress) {
        if (
          !latestProgress.has(
            item.bookId
          )
        ) {
          latestProgress.set(
            item.bookId,
            item
          )
        }
      }

      const mappedBooks =
        await Promise.all(
          booksData.map(
            async book => ({
              id: book.id,
              type: 'book',

              title: book.title,

              author:
                book.author ?? '',

              coverUrl:
                await getSignedUrl(
                  book.coverBucket ||
                    'Covers',
                  book.coverPath
                ),

              pageCount:
                book.pageCount ?? 0,

              progress:
                latestProgress.get(
                  book.id
                ) ?? null,

              raw: book
            })
          )
        )

      const mappedSeries =
        await Promise.all(
          seriesData.map(
            async series => {
              const progress =
                latestProgress.get(
                  series.id
                )

              const activeVolume =
                progress?.volumeId
                  ? series.volumes.find(
                      volume =>
                        volume.id ===
                        progress.volumeId
                    )
                  : null

              const displayVolume =
                activeVolume ??
                series.volumes?.[0]

              return {
                id: series.id,
                type: 'series',

                title:
                  series.name,

                volumeCount:
                  series.volumes
                    ?.length ?? 0,

                coverUrl:
                  await getSignedUrl(
                    'Covers',
                    displayVolume?.coverPath
                  ),

                volumes:
                  series.volumes,

                progress,

                raw: series
              }
            }
          )
        )

      setBooks(mappedBooks)
      setSeries(mappedSeries)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return {
    books,
    series,
    loading,
    reload: load
  }
}