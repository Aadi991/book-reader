import { useEffect, useMemo, useState } from 'react'

import useSeries from '../../application/useSeries'
import useBookUrl from '../../application/useBookUrl'
import useReadingHistory from '../../application/useReadingHistory'

import VolumeSidebar from '../organisms/VolumeSidebar'
import PdfReader from '../organisms/PdfReader'
import CenterState from '../organisms/CentreState'

export default function SeriesPage({
  seriesId,
  userId
}) {
  const {
    series,
    loading: seriesLoading,
    error
  } = useSeries(seriesId)

  const [sidebarOpen, setSidebarOpen] =
    useState(true)

  const [selectedVolume, setSelectedVolume] =
    useState(null)

  const {
    progress,
    loading: progressLoading,
    saveReadingHistory
  } = useReadingHistory({
    userId,
    bookId: seriesId
  })

  const { bookUrl } =
    useBookUrl(selectedVolume)

  const sortedVolumes = useMemo(() => {
    return [...(series?.volumes || [])].sort(
      (a, b) =>
        Number(a.volumeNo || 0) -
        Number(b.volumeNo || 0)
    )
  }, [series])

  useEffect(() => {
    console.log(
      '[SeriesPage] progress changed',
      progress
    )
  }, [progress])

  useEffect(() => {
    console.log(
      '[SeriesPage] selectedVolume changed',
      selectedVolume
    )
  }, [selectedVolume])

  /**
   * Restore last read volume
   */
  useEffect(() => {
    if (!series) return
    if (selectedVolume) return

    if (progress?.volumeId) {
      const savedVolume =
        sortedVolumes.find(
          v => v.id === progress.volumeId
        )

      if (savedVolume) {
        console.log(
          '[SeriesPage] Restoring volume',
          savedVolume
        )

        setSelectedVolume(savedVolume)
        return
      }
    }

    /**
     * No reading history
     * Select first volume
     */
    if (sortedVolumes.length > 0) {
      console.log(
        '[SeriesPage] Selecting first volume'
      )

      setSelectedVolume(
        sortedVolumes[0]
      )
    }
  }, [
    series,
    progress,
    selectedVolume,
    sortedVolumes
  ])

  function handlePageChange(page) {
    console.log(
      '[SeriesPage] handlePageChange',
      {
        page,
        selectedVolume
      }
    )

    if (!selectedVolume) {
      console.warn(
        '[SeriesPage] No selected volume'
      )

      return
    }

    saveReadingHistory({
      volumeId: selectedVolume.id,
      volumeNo:
        selectedVolume.volumeNo,
      page
    })
  }

  if (
    seriesLoading ||
    progressLoading
  ) {
    return (
      <CenterState
        loading
        title="Loading Library"
        subtitle="Restoring your reading progress..."
      />
    )
  }

  if (error) {
    return (
      <CenterState
        icon="⚠️"
        title="Something Went Wrong"
        subtitle={error.message}
      />
    )
  }

  const initialPage =
    progress?.volumeId ===
    selectedVolume?.id
      ? progress?.page || 1
      : 1

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          height: '100%'
        }}
      >
        {selectedVolume ? (
          bookUrl ? (
            <PdfReader
              key={`${selectedVolume.id}-${initialPage}`}
              url={bookUrl}
              title={
                selectedVolume.title
              }
              initialPage={
                initialPage
              }
              onPageChange={
                handlePageChange
              }
            />
          ) : (
            <CenterState
              loading
              title="Loading Volume"
              subtitle="Preparing your PDF and rendering pages..."
            />
          )
        ) : (
          <CenterState
            icon="📚"
            title="No Volumes Available"
            subtitle="This series does not contain any volumes."
          />
        )}
      </div>

      {sidebarOpen && (
        <VolumeSidebar
          sortedVolumes={
            sortedVolumes
          }
          series={series}
          selectedVolume={
            selectedVolume
          }
          setSelectedVolume={
            setSelectedVolume
          }
        />
      )}

      <button
        onClick={() =>
          setSidebarOpen(
            open => !open
          )
        }
        style={{
          position: 'absolute',
          top: '50%',
          left: sidebarOpen
            ? 320
            : 0,
          transform:
            'translateY(-50%)',
          width: 36,
          height: 90,
          border:
            '1px solid #ddd',
          borderLeft: 'none',
          borderRadius:
            '0 14px 14px 0',
          background: '#fff',
          cursor: 'pointer',
          zIndex: 1001,
          boxShadow:
            '0 4px 12px rgba(0,0,0,.12)',
          fontSize: 18,
          fontWeight: 600,
          transition:
            'left 0.2s ease'
        }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>
    </div>
  )
}