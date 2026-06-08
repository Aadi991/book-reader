  import { useEffect, useMemo, useState } from 'react'

  import useSeries from '../../../application/useSeries'
  import useBookUrl from '../../../application/useBookUrl'
  import useReadingHistory from '../../../application/useReadingHistory'

  import VolumeSidebar from '../organisms/VolumeSidebar'
  import PdfReader from '../organisms/PdfReader'
  import CenterState from '../organisms/CentreState'
  import {navigate} from '../../navigate' 

  export default function SeriesPage({
    seriesId,
    userId
  }) {
    const {
      series,
      loading: seriesLoading,
      error
    } = useSeries(seriesId)

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [selectedVolume, setSelectedVolume] = useState(null)

    const {
      progress,
      loading: progressLoading,
      saveReadingHistory
    } = useReadingHistory({
      userId,
      bookId: seriesId
    })

    const { bookUrl } = useBookUrl(selectedVolume)

    // ---------------- SORT ----------------
    const sortedVolumes = useMemo(() => {
      return [...(series?.volumes || [])].sort(
        (a, b) =>
          Number(a.volumeNo || 0) - Number(b.volumeNo || 0)
      )
    }, [series])

    // ---------------- RESTORE VOLUME ----------------
    useEffect(() => {
      if (!series) return
      if (progressLoading) return // Wait until progress is loaded to restore or fallback
      if (selectedVolume) return

      if (progress?.volumeId) {
        const saved = sortedVolumes.find(
          v => v.id === progress.volumeId
        )

        if (saved) {
          setSelectedVolume(saved)
          return
        }
      }

      if (sortedVolumes.length > 0) {
        setSelectedVolume(sortedVolumes[0])
      }
    }, [series, progress, progressLoading, selectedVolume, sortedVolumes])

    useEffect(() => {
      console.log('[SeriesPage] progress', progress)
    }, [progress])

    useEffect(() => {
      console.log('[SeriesPage] selectedVolume', selectedVolume)
    }, [selectedVolume])

    function handlePageChange(page) {
      if (!selectedVolume) return

      saveReadingHistory({
        volumeId: selectedVolume.id,
        volumeNo: selectedVolume.volumeNo,
        page
      })
    }

    // ---------------- ALL HOOKS ABOVE RETURNS (IMPORTANT FIX) ----------------
    const initialPage = useMemo(() => {
    if (!progress || !selectedVolume) return 1

    if (progress?.volumeId === selectedVolume?.id) {
      return progress?.page || 1
    }

    return 1
  }, [progress, selectedVolume])

    const isReady = selectedVolume && bookUrl

    // ---------------- EARLY RETURNS (NOW SAFE) ----------------
    if (seriesLoading || progressLoading) {
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

    // ---------------- RENDER ----------------
    return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      
      
        <div style={{ height: '100%' }}>
          {isReady ? (
            <PdfReader
              key={selectedVolume.id}
              url={bookUrl}
              title={selectedVolume.title}
              initialPage={initialPage}
              onPageChange={handlePageChange}
            />
          ) : (
            <CenterState
              loading
              title="Loading Volume"
              subtitle="Preparing your PDF and rendering pages..."
            />
          )}
        </div>

        {sidebarOpen && (
          <VolumeSidebar
            sortedVolumes={sortedVolumes}
            series={series}
            selectedVolume={selectedVolume}
            setSelectedVolume={setSelectedVolume}
          />
        )}

        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            position: 'absolute',
            top: '50%',
            left: sidebarOpen ? 320 : 0,
            transform: 'translateY(-50%)',
            width: 36,
            height: 90,
            border: '1px solid #ddd',
            borderLeft: 'none',
            borderRadius: '0 14px 14px 0',
            background: '#fff',
            cursor: 'pointer',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(0,0,0,.12)',
            fontSize: 18,
            fontWeight: 600,
            transition: 'left 0.25s ease'
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>
    )
  }