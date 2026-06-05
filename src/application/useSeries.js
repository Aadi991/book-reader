import { useEffect, useState } from 'react'
import SeriesRepository from '../data/SeriesRepository'

export default function useSeries(seriesId) {
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  console.log('[useSeries] module loaded')

  useEffect(() => {
    console.group('[useSeries] Effect triggered')

    console.log('seriesId:', seriesId)
    console.log('seriesId type:', typeof seriesId)

    if (!seriesId) {
      console.warn(
        '[useSeries] No seriesId provided'
      )
      console.groupEnd()
      return
    }

    async function loadSeries() {
      const started = performance.now()

      try {
        console.group(
          '[useSeries] Loading series'
        )

        setLoading(true)
        setError(null)

        console.log(
          'Calling SeriesRepository.get()'
        )
        console.log('seriesId:', seriesId)

        const data =
          await SeriesRepository.get(seriesId)

        console.log(
          'SeriesRepository.get() returned:'
        )
        console.dir(data)

        if (!data) {
          console.error(
            '[useSeries] Repository returned null'
          )

          throw new Error('Series not found')
        }

        console.log(
          '[useSeries] Setting series state'
        )

        setSeries(data)

        console.log(
          '[useSeries] Series loaded successfully'
        )
        console.log(
          'Series title:',
          data.title
        )
        console.log(
          'Volume count:',
          data.volumes?.length ?? 0
        )

        if (data.volumes?.length) {
          console.table(
            data.volumes.map(v => ({
              id: v.id,
              title: v.title,
              volumeNo: v.volumeNo
            }))
          )
        }
      } catch (err) {
        console.error(
          '[useSeries] Failed to load series'
        )

        console.error('Error object:', err)
        console.error(
          'Error message:',
          err?.message
        )
        console.error(
          'Error stack:',
          err?.stack
        )

        setError(err)
      } finally {
        const elapsed =
          performance.now() - started

        console.log(
          `[useSeries] Finished in ${elapsed.toFixed(
            2
          )}ms`
        )

        setLoading(false)

        console.groupEnd()
        console.groupEnd()
      }
    }

    loadSeries()
  }, [seriesId])

  useEffect(() => {
    console.log(
      '[useSeries] series state updated:',
      series
    )
  }, [series])

  useEffect(() => {
    console.log(
      '[useSeries] loading state:',
      loading
    )
  }, [loading])

  useEffect(() => {
    if (error) {
      console.error(
        '[useSeries] error state:',
        error
      )
    }
  }, [error])

  return {
    series,
    loading,
    error
  }
}