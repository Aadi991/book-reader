import React, { useEffect, useMemo, useState } from 'react'
import useSeries from '../../../application/useSeries'
import useBookUrl from '../../../application/useBookUrl'
import useReadingHistory from '../../../application/useReadingHistory'
import PdfReader from '../../desktop/organisms/PdfReader'
import { navigate } from '../../navigate'

export default function SeriesPage({ seriesId, userId }) {
  const { series, loading: seriesLoading, error } = useSeries(seriesId)
  const [selectedVolume, setSelectedVolume] = useState(null)
  const [showVolumes, setShowVolumes] = useState(false)
  const [showUi, setShowUi] = useState(false)

  const { progress, loading: progressLoading, saveReadingHistory } = useReadingHistory({ userId, bookId: seriesId })
  const { bookUrl } = useBookUrl(selectedVolume)

  const sortedVolumes = useMemo(() => {
    return [...(series?.volumes || [])].sort((a, b) => Number(a.volumeNo || 0) - Number(b.volumeNo || 0))
  }, [series])

  useEffect(() => {
    if (!series || selectedVolume) return
    if (progress?.volumeId) {
      const saved = sortedVolumes.find(v => v.id === progress.volumeId)
      if (saved) { setSelectedVolume(saved); return }
    }
    if (sortedVolumes.length > 0) setSelectedVolume(sortedVolumes[0])
  }, [series, progress, selectedVolume, sortedVolumes])

  function handlePageChange(page) {
    if (!selectedVolume) return
    saveReadingHistory({ volumeId: selectedVolume.id, volumeNo: selectedVolume.volumeNo, page })
  }

  const initialPage = useMemo(() => {
    if (!progress || !selectedVolume) return 1
    if (progress?.volumeId === selectedVolume?.id) return progress?.page || 1
    return 1
  }, [progress, selectedVolume])

  if (seriesLoading || progressLoading) {
    return <div className="flex h-screen items-center justify-center bg-surface">Loading series...</div>
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-surface">{error.message}</div>
  }

  return (
    <div className="relative h-screen w-full bg-surface overflow-hidden" onClick={() => setShowUi(!showUi)}>
      {showUi && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent text-white z-50 flex items-center justify-between">
          <button onClick={(e) => { e.stopPropagation(); navigate('/library'); }} className="p-2">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-medium truncate px-4">{selectedVolume?.title || series.title}</span>
          <button onClick={(e) => { e.stopPropagation(); setShowVolumes(true); }} className="p-2">
            <span className="material-symbols-outlined">format_list_bulleted</span>
          </button>
        </div>
      )}

      {selectedVolume && bookUrl ? (
        <PdfReader
          key={selectedVolume.id}
          url={bookUrl}
          title={selectedVolume.title}
          initialPage={initialPage}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="flex h-screen items-center justify-center">Loading PDF...</div>
      )}

      {showVolumes && (
        <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end" onClick={(e) => { e.stopPropagation(); setShowVolumes(false); }}>
          <div className="bg-surface-container rounded-t-3xl max-h-[70vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Volumes</h3>
              <button onClick={() => setShowVolumes(false)} className="p-2 bg-surface-container-high rounded-full w-8 h-8 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {sortedVolumes.map(vol => (
                <button
                  key={vol.id}
                  onClick={() => { setSelectedVolume(vol); setShowVolumes(false); setShowUi(false); }}
                  className={`p-4 rounded-xl text-left ${selectedVolume?.id === vol.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high'}`}
                >
                  <div className="font-medium">Vol {vol.volumeNo}: {vol.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
