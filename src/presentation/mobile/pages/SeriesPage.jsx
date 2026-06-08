import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import useSeries from '../../../application/useSeries'
import useBookUrl from '../../../application/useBookUrl'
import useReadingHistory from '../../../application/useReadingHistory'
import PdfReader from '../../desktop/organisms/PdfReader'
import { navigate } from '../../navigate'

/* ── inline styles for the carousel (no external CSS file needed) ── */
const carouselStyles = `
  .vol-carousel-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9000;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: rgba(0,0,0,0);
    animation: volFadeIn 0.25s ease forwards;
    -webkit-tap-highlight-color: transparent;
  }
  @keyframes volFadeIn {
    to { background: rgba(0,0,0,0.55); }
  }
  .vol-carousel-backdrop.closing {
    animation: volFadeOut 0.2s ease forwards;
  }
  @keyframes volFadeOut {
    from { background: rgba(0,0,0,0.55); }
    to   { background: rgba(0,0,0,0); }
  }

  .vol-carousel-sheet {
    background: var(--surface-container, #eaedff);
    border-radius: 1.75rem 1.75rem 0 0;
    padding: 1.25rem 0 2rem;
    transform: translateY(100%);
    animation: volSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
    will-change: transform;
    -webkit-overflow-scrolling: touch;
    position: relative;
    z-index: 9001;
  }
  .vol-carousel-backdrop.closing .vol-carousel-sheet {
    animation: volSlideDown 0.2s ease forwards;
  }
  @keyframes volSlideUp {
    to { transform: translateY(0); }
  }
  @keyframes volSlideDown {
    from { transform: translateY(0); }
    to   { transform: translateY(100%); }
  }

  /* ── grab handle ── */
  .vol-handle {
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background: var(--outline-variant, #c1c8c4);
    margin: 0 auto 1rem;
  }

  /* ── horizontal scroll track ── */
  .vol-track {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 0.25rem 1.25rem 0.75rem;
    scrollbar-width: none;
    cursor: grab;
  }
  .vol-track:active { cursor: grabbing; }
  .vol-track::-webkit-scrollbar { display: none; }

  /* ── individual card ── */
  .vol-card {
    flex: 0 0 auto;
    width: 140px;
    scroll-snap-align: center;
    border-radius: 1.25rem;
    padding: 1rem 0.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    position: relative;
    background: var(--surface-container-high, #e2e7ff);
    border: 2px solid transparent;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
  }
  .vol-card:active {
    transform: scale(0.96);
  }
  .vol-card.active {
    background: var(--primary, #44655b);
    color: var(--on-primary, #fff);
    border-color: rgba(255,255,255,0.25);
    box-shadow: 0 4px 20px rgba(68,101,91,0.35);
  }

  /* ── badge ── */
  .vol-badge {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.1rem;
    background: var(--primary-container, #d1f5e8);
    color: var(--on-primary-container, #517167);
    transition: background 0.2s ease, color 0.2s ease;
  }
  .vol-card.active .vol-badge {
    background: rgba(255,255,255,0.22);
    color: var(--on-primary, #fff);
  }

  /* ── title text ── */
  .vol-title {
    font-size: 0.78rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
    color: var(--on-surface, #131b2e);
    transition: color 0.2s ease;
  }
  .vol-card.active .vol-title {
    color: var(--on-primary, #fff);
  }

  /* ── "reading" indicator dot ── */
  .vol-reading-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary, #44655b);
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .vol-card.active .vol-reading-dot {
    background: rgba(255,255,255,0.7);
    opacity: 1;
  }

  /* ── header row ── */
  .vol-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem;
    margin-bottom: 0.85rem;
  }
  .vol-header h3 {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--on-surface, #131b2e);
    margin: 0;
  }
  .vol-header .vol-counter {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--outline, #717975);
    background: var(--surface-container-high, #e2e7ff);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }
  .vol-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-container-high, #e2e7ff);
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
    color: var(--on-surface, #131b2e);
    -webkit-tap-highlight-color: transparent;
  }
  .vol-close-btn:active {
    background: var(--outline-variant, #c1c8c4);
  }

  /* ── dots pagination ── */
  .vol-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    padding-top: 0.5rem;
    flex-wrap: wrap;
    max-width: 200px;
    margin: 0 auto;
  }
  .vol-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--outline-variant, #c1c8c4);
    transition: background 0.2s ease, width 0.2s ease;
    flex-shrink: 0;
  }
  .vol-dot.active {
    width: 18px;
    border-radius: 3px;
    background: var(--primary, #44655b);
  }
`

export default function SeriesPage({ seriesId, userId }) {
  const { series, loading: seriesLoading, error } = useSeries(seriesId)
  const [selectedVolume, setSelectedVolume] = useState(null)
  const [showVolumes, setShowVolumes] = useState(false)
  const [closingVolumes, setClosingVolumes] = useState(false)
  const [showUi, setShowUi] = useState(false)
  const [visibleIdx, setVisibleIdx] = useState(0)
  const trackRef = useRef(null)

  const { progress, loading: progressLoading, saveReadingHistory } = useReadingHistory({ userId, bookId: seriesId })
  const { bookUrl } = useBookUrl(selectedVolume)

  const sortedVolumes = useMemo(() => {
    return [...(series?.volumes || [])].sort((a, b) => Number(a.volumeNo || 0) - Number(b.volumeNo || 0))
  }, [series])

  useEffect(() => {
    if (!series) return
    if (progressLoading) return
    if (selectedVolume) return
    if (progress?.volumeId) {
      const saved = sortedVolumes.find(v => v.id === progress.volumeId)
      if (saved) { setSelectedVolume(saved); return }
    }
    if (sortedVolumes.length > 0) setSelectedVolume(sortedVolumes[0])
  }, [series, progress, progressLoading, selectedVolume, sortedVolumes])

  /* scroll the carousel to the selected volume when opened */
  useEffect(() => {
    if (!showVolumes || !trackRef.current || !selectedVolume) return
    const idx = sortedVolumes.findIndex(v => v.id === selectedVolume.id)
    if (idx < 0) return
    const card = trackRef.current.children[idx]
    if (card) {
      requestAnimationFrame(() => {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      })
    }
    setVisibleIdx(idx)
  }, [showVolumes])

  /* track which card is centered while scrolling */
  const handleTrackScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const center = track.scrollLeft + track.clientWidth / 2
    let closestIdx = 0
    let closestDist = Infinity
    for (let i = 0; i < track.children.length; i++) {
      const child = track.children[i]
      const childCenter = child.offsetLeft + child.offsetWidth / 2
      const dist = Math.abs(childCenter - center)
      if (dist < closestDist) { closestDist = dist; closestIdx = i }
    }
    setVisibleIdx(closestIdx)
  }, [])

  function handlePageChange(page) {
    if (!selectedVolume) return
    saveReadingHistory({ volumeId: selectedVolume.id, volumeNo: selectedVolume.volumeNo, page })
  }

  const initialPage = useMemo(() => {
    if (!progress || !selectedVolume) return 1
    if (progress?.volumeId === selectedVolume?.id) return progress?.page || 1
    return 1
  }, [progress, selectedVolume])

  function closeCarousel() {
    setClosingVolumes(true)
    setTimeout(() => {
      setShowVolumes(false)
      setClosingVolumes(false)
    }, 200)
  }

  function selectVol(vol) {
    setSelectedVolume(vol)
    closeCarousel()
    setShowUi(false)
  }

  if (seriesLoading || progressLoading) {
    return <div className="flex h-screen items-center justify-center bg-surface">Loading series...</div>
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-surface">{error.message}</div>
  }

  return (
    <div className="relative h-screen w-full bg-surface overflow-hidden" onClick={() => setShowUi(!showUi)}>
      {/* injected carousel styles */}
      <style>{carouselStyles}</style>

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

      {/* ── Volume Carousel Overlay ── */}
      {showVolumes && (
        <div
          className={`vol-carousel-backdrop${closingVolumes ? ' closing' : ''}`}
          onClick={(e) => { e.stopPropagation(); closeCarousel(); }}
        >
          <div className="vol-carousel-sheet" onClick={e => e.stopPropagation()}>
            {/* grab handle */}
            <div className="vol-handle" />

            {/* header */}
            <div className="vol-header">
              <h3>Volumes</h3>
              <span className="vol-counter">{sortedVolumes.length} vol{sortedVolumes.length !== 1 ? 's' : ''}</span>
              <button className="vol-close-btn" onClick={closeCarousel}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            {/* horizontal card carousel */}
            <div className="vol-track" ref={trackRef} onScroll={handleTrackScroll}>
              {sortedVolumes.map((vol, i) => (
                <div
                  key={vol.id}
                  className={`vol-card${selectedVolume?.id === vol.id ? ' active' : ''}`}
                  onClick={() => selectVol(vol)}
                >
                  <div className="vol-badge">{vol.volumeNo ?? i + 1}</div>
                  <div className="vol-title">{vol.title}</div>
                  <div className="vol-reading-dot" />
                </div>
              ))}
            </div>

            {/* dot pagination */}
            {sortedVolumes.length > 1 && (
              <div className="vol-dots">
                {sortedVolumes.map((_, i) => (
                  <div key={i} className={`vol-dot${i === visibleIdx ? ' active' : ''}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
