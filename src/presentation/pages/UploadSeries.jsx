import React, { useEffect, useRef, useState } from 'react'
import { navigate } from '../../navigate'
import StorageService from '../../packages/shared/src/services/StorageService'
import { useAuth } from '../../features/auth/AuthProvider'
import BookRepository from '../../packages/shared/src/repositories/BookRepository'

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.min.js'
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js'

let pdfJsPromise = null

async function loadPdfJs() {
  if (typeof window === 'undefined') throw new Error('PDF.js requires browser context')
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN
    return window.pdfjsLib
  }
  if (pdfJsPromise) return pdfJsPromise

  pdfJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = PDFJS_CDN
    script.async = true
    script.onload = () => {
      if (!window.pdfjsLib) {
        reject(new Error('PDF.js failed to load'))
        return
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN
      resolve(window.pdfjsLib)
    }
    script.onerror = () => reject(new Error('Could not load PDF.js CDN'))
    document.body.appendChild(script)
  })

  return pdfJsPromise
}

function fileSizeMB(bytes) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`
}

function slugify(text) {
  return (text || 'untitled-series')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled-series'
}

function dataUrlToBlob(dataUrl) {
  const [meta, data] = dataUrl.split(',')
  const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export default function UploadSeries() {
  const [seriesName, setSeriesName] = useState('')
  const [files, setFiles] = useState([])
  const [uploadQueue, setUploadQueue] = useState([])
  const [pendingQueue, setPendingQueue] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [candidate, setCandidate] = useState(null)
  const [candidateBusy, setCandidateBusy] = useState(false)
  const [isPagePickerOpen, setIsPagePickerOpen] = useState(false)
  const [pageInput, setPageInput] = useState('1')
  const [dragActive, setDragActive] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [dropIndicator, setDropIndicator] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const inputRef = useRef(null)
  const nextIdRef = useRef(1)
  const processingRef = useRef(false)
  const { user } = useAuth()

  useEffect(() => {
    if (candidate || candidateBusy) return
    if (pendingQueue.length === 0) return

    const [nextFile, ...rest] = pendingQueue
    setPendingQueue(rest)
    prepareCandidate(nextFile)
  }, [pendingQueue, candidate, candidateBusy])

  useEffect(() => {
    if (!candidate) {
      setIsPagePickerOpen(false)
      return
    }
    setPageInput(String(candidate.coverPage || 1))
    setIsPagePickerOpen(false)
  }, [candidate])

  async function renderPdfPreview(file, requestedPage = 1) {
    const pdfjsLib = await loadPdfJs()
    const data = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data }).promise
    const safePage = Math.min(Math.max(1, requestedPage), pdf.numPages)
    const page = await pdf.getPage(safePage)
    const viewport = page.getViewport({ scale: 1.2 })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    await page.render({ canvasContext: ctx, viewport }).promise
    const coverDataUrl = canvas.toDataURL('image/jpeg', 0.86)
    return { coverDataUrl, pageCount: pdf.numPages, coverPage: safePage }
  }

  async function prepareCandidate(file) {
    setCandidateBusy(true)
    setError(null)
    try {
      const preview = await renderPdfPreview(file, 1)
      setCandidate({
        tempId: `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        existingId: null,
        file,
        name: file.name,
        size: file.size,
        volumeNo: String(files.length + 1),
        ...preview
      })
    } catch (err) {
      setError(err?.message || 'Failed to preview PDF')
    } finally {
      setCandidateBusy(false)
    }
  }
  function handleDragEnter(e) {
    e.preventDefault()
    if (draggedId === null) setDragActive(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    if (draggedId === null) setDragActive(false)
  }

  function maybeAutoScroll(clientY) {
    const threshold = 120
    const speed = 18
    if (clientY < threshold) {
      window.scrollBy(0, -speed)
    } else if (window.innerHeight - clientY < threshold) {
      window.scrollBy(0, speed)
    }
  }

  function onFilesSelected(list) {
    const arr = Array.from(list || []).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    if (arr.length === 0) {
      setNotice('No PDF files selected')
      return
    }
    setPendingQueue((prev) => [...prev, ...arr])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files)
      try { e.dataTransfer.clearData() } catch (err) { /* ignore */ }
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    maybeAutoScroll(e.clientY)
    setContainerDropIndicator(e.clientY)
  }

  async function applyCandidateCoverPage(pageValue) {
    if (!candidate) return
    const fallbackMax = candidate.pageCount || 1
    const requestedPage = Number.parseInt(pageValue, 10)
    if (!Number.isFinite(requestedPage) || requestedPage < 1) {
      setError('Enter a valid page number.')
      return
    }
    const safePage = Math.min(requestedPage, fallbackMax)

    setCandidateBusy(true)
    setError(null)
    try {
      const preview = await renderPdfPreview(candidate.file, safePage)
      setCandidate((prev) => prev ? { ...prev, ...preview } : prev)
      setIsPagePickerOpen(false)
    } catch (err) {
      setError(err?.message || 'Failed to change cover page')
    } finally {
      setCandidateBusy(false)
    }
  }

  async function acceptCandidate() {
    if (!candidate) return
    const parsedVolumeNo = Number.parseInt(candidate.volumeNo, 10)
    if (!Number.isFinite(parsedVolumeNo) || parsedVolumeNo < 1) {
      setError('Enter a valid volume number (1 or greater).')
      return
    }

    setCandidateBusy(false)
    setError(null)
    setNotice(null)

    // Create file record locally and enqueue for background upload
    const seriesSlug = slugify(seriesName)
    const fileSlug = slugify(candidate.name.replace(/\.pdf$/i, ''))
    const basePath = `public/${seriesSlug}`
    const coverPath = `${basePath}/vol-${parsedVolumeNo}-${fileSlug}.jpg`
    const bookPath = `${basePath}/vol-${parsedVolumeNo}-${fileSlug}.pdf`
    const blob = dataUrlToBlob(candidate.coverDataUrl)

    if (candidate.existingId) {
      // update existing entry and mark queued
      setFiles((prev) => prev.map((f) => (
        f.id === candidate.existingId
          ? {
            ...f,
            volumeNo: parsedVolumeNo,
            coverPage: candidate.coverPage,
            pageCount: candidate.pageCount,
            coverDataUrl: candidate.coverDataUrl,
            coverPath: f.coverPath || coverPath,
            bookPath: f.bookPath || bookPath,
            status: 'queued',
            progress: 0
          }
          : f
      )))
      // enqueue
      setUploadQueue((q) => ([
        ...q,
        {
          id: candidate.existingId,
          file: candidate.file,
          coverBlob: blob,
          coverPath,
          bookPath
        }
      ]))
    } else {
      const finalId = `vol-${nextIdRef.current++}`
      const newEntry = {
        id: finalId,
        file: candidate.file,
        name: candidate.name,
        size: candidate.size,
        volumeNo: parsedVolumeNo,
        status: 'queued',
        progress: 0,
        coverPage: candidate.coverPage,
        pageCount: candidate.pageCount,
        coverDataUrl: candidate.coverDataUrl,
        coverPath: null,
        bookPath: null
      }
      setFiles((prev) => ([...prev, newEntry]))
      setUploadQueue((q) => ([...q, { id: finalId, file: candidate.file, coverBlob: blob, coverPath, bookPath }]))
    }

    setNotice('Accepted — queued for upload. You can continue.')
    setCandidate(null)
  }

  function rejectCandidate() {
    setCandidate(null)
    setError(null)
    setNotice(null)
  }

  // Background upload processor: sequentially process `uploadQueue`
  useEffect(() => {
    if (processingRef.current) return
    if (uploadQueue.length === 0) return

    processingRef.current = true

    ;(async () => {
      while (true) {
        let item = null
        // pop the next item atomically
        setUploadQueue((prev) => {
          if (!prev || prev.length === 0) return prev
          item = prev[0]
          return prev.slice(1)
        })
        if (!item) break

        // mark file as uploading
        setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'uploading', progress: 0 } : f))

        try {
          // Upload cover (with progress) then PDF (with progress)
          // We'll weight cover 30% and pdf 70% for combined progress display
          await StorageService.uploadBookWithProgress('Covers', item.coverPath, item.coverBlob, { upsert: true }, (loaded, total) => {
            const pct = Math.round((loaded / total) * 30)
            setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, progress: Math.min(30, pct) } : f))
          })
          // after cover uploaded, mark coverPath
          setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, coverPath: item.coverPath } : f))

          await StorageService.uploadBookWithProgress('Books', item.bookPath, item.file, { upsert: true }, (loaded, total) => {
            const pct = Math.round((loaded / total) * 70)
            setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, progress: 30 + Math.min(70, pct) } : f))
          })

            // mark done
            setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'done', progress: 100, bookPath: item.bookPath } : f))

            // create Firestore record for the book if we have a signed-in user
            try {
              const doc = {
                title: item.name || (item.file && item.file.name) || `Volume ${item.id}`,
                author: 'Unknown',
                ownerId: user?.uid || null,
                storagePath: item.bookPath,
                coverPath: item.coverPath,
                coverBucket: 'Covers',
                createdAt: new Date().toISOString()
              }
              await BookRepository.add(doc)
            } catch (e) {
              console.warn('Failed to create Firestore record for', item.id, e)
            }
        } catch (e) {
          console.error('Upload failed for', item, e)
          setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'error', progress: 0 } : f))
          setNotice((n) => (n ? n + ' ' : '') + `Upload failed for ${item.id}: ${e?.message || String(e)}`)
        }
      }
      processingRef.current = false
    })()
  }, [uploadQueue])

  function reorderVolumes(fromId, toId, position = 'before') {
    if (fromId === toId) return
    setFiles((prev) => {
      const fromIndex = prev.findIndex((f) => f.id === fromId)
      if (fromIndex < 0) return prev

      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      const targetIndex = next.findIndex((f) => f.id === toId)
      if (targetIndex < 0) return prev
      const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
      next.splice(insertIndex, 0, moved)
      return next
    })
  }

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  function setContainerDropIndicator(clientY) {
    if (files.length === 0 || draggedId === null) return
    const firstId = files[0].id
    const lastId = files[files.length - 1].id
    const threshold = 140
    if (clientY < threshold) {
      setDropIndicator({ id: firstId, position: 'before' })
    } else if (window.innerHeight - clientY < threshold) {
      setDropIndicator({ id: lastId, position: 'after' })
    }
  }

  async function finishUpload() {
    // simulate upload progress for each file
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading', progress: 0 })))
    for (let i = 0; i < files.length; i++) {
      const id = files[i].id
      for (let p = 10; p <= 100; p += 10) {
        await new Promise(r => setTimeout(r, 80))
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
      }
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done' } : f))
    }
  }

  return (
    <main
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className="px-10 max-w-6xl mx-auto w-full pt-12 md:pt-16 pb-16 relative"
    >
      {dragActive && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-[#44655b] bg-[#d1f5e8]/25 z-20" />
      )}

      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="font-plus font-bold text-3xl text-ink-black mb-2 tracking-tight">Upload Series Volumes</h1>
          <p className="font-plus text-base text-on-surface-variant">Drag and drop multiple PDF files to add them to your new collection.</p>
          <div className="mt-4 max-w-md">
            <label htmlFor="seriesName" className="block font-plus font-bold text-sm text-ink-black mb-1">Series Name</label>
            <input
              id="seriesName"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              placeholder="Enter series title"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black/10 bg-white text-ink-black font-plus"
            />
          </div>
        </div>
        <button onClick={() => navigate('/upload/select')} className="text-on-surface-variant hover:text-ink-black flex items-center gap-1 font-plus font-bold text-sm transition-colors">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          Cancel
        </button>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <span className="material-symbols-outlined text-[#44655b]" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
        <p className="font-plus text-sm text-on-surface-variant">Drop PDFs anywhere on this page (processed one-by-one) or</p>
        <input ref={inputRef} type="file" accept="application/pdf" multiple className="sr-only" onChange={e => onFilesSelected(e.target.files)} />
        <button onClick={() => inputRef.current?.click()} className="px-3 py-1.5 rounded-lg border-2 border-black/10 bg-white text-ink-black font-plus font-bold text-sm hover:bg-gray-50 transition-colors">browse files</button>
        <span className="font-plus text-xs text-on-surface-variant">Queue: {pendingQueue.length}</span>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            className={`p-2 border-2 rounded-lg transform transition-all duration-150 ${viewMode === 'grid' ? 'border-on-surface bg-surface shadow-[3px_3px_0px_rgba(19,27,46,1)]' : 'border-on-surface bg-white'} hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`p-2 border-2 rounded-lg transform transition-all duration-150 ${viewMode === 'list' ? 'border-on-surface bg-surface shadow-[3px_3px_0px_rgba(19,27,46,1)]' : 'border-on-surface bg-white'} hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
          >
            List
          </button>
        </div>
      </div>

      {candidateBusy && !candidate && (
        <div className="mb-6 p-4 rounded-xl border-2 border-black/10 bg-white font-plus text-sm text-on-surface-variant">
          Preparing next PDF preview...
        </div>
      )}

      {candidate && (
        <section className="mb-8 p-4 rounded-xl border-2 border-black/10 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-32 h-44 rounded-lg overflow-hidden border-2 border-black/10 bg-surface-container">
              <img src={candidate.coverDataUrl} alt="Candidate cover preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-plus font-bold text-lg text-ink-black">Review Next Volume</h3>
              <p className="font-plus text-sm text-on-surface-variant mt-1 break-words">{candidate.name}</p>
              <p className="font-plus text-xs text-on-surface-variant mt-1">{fileSizeMB(candidate.size)} • {candidate.pageCount} pages • Preview page {candidate.coverPage}</p>
              <div className="mt-3 max-w-xs">
                <label htmlFor="candidateVolumeNo" className="block font-plus font-bold text-sm text-ink-black mb-1">Volume Number</label>
                <input
                  id="candidateVolumeNo"
                  value={candidate.volumeNo}
                  onChange={(e) => setCandidate((prev) => prev ? { ...prev, volumeNo: e.target.value } : prev)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black/10 bg-white text-ink-black font-plus"
                  inputMode="numeric"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {!isPagePickerOpen ? (
                  <button onClick={() => setIsPagePickerOpen(true)} disabled={candidateBusy} className="py-2 px-3 border-2 border-on-surface rounded-lg bg-surface text-on-surface font-label-bold text-label-sm text-center disabled:opacity-50">Change Page</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      className="w-24 px-2 py-2 rounded-lg border-2 border-black/10 bg-white text-ink-black font-plus text-sm"
                      inputMode="numeric"
                      disabled={candidateBusy}
                    />
                    <button
                      onClick={() => applyCandidateCoverPage(pageInput)}
                      disabled={candidateBusy}
                      className="w-10 h-10 border-2 border-[#131b2e] rounded-lg bg-[#44655b] text-white flex items-center justify-center disabled:opacity-50"
                      aria-label="Apply page"
                    >
                      <span className="material-symbols-outlined text-lg">check</span>
                    </button>
                  </div>
                )}
                <button onClick={rejectCandidate} disabled={candidateBusy} className="py-2 px-3 border-2 border-black/10 rounded-lg bg-white text-ink-black font-plus font-bold text-sm disabled:opacity-50">Reject</button>
                <button onClick={acceptCandidate} disabled={candidateBusy} className="py-2 px-3 border-2 border-[#131b2e] rounded-lg bg-[#44655b] text-white font-plus font-bold text-sm disabled:opacity-50">Accept & Save Cover</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {error && <p className="mb-6 text-sm text-red-600 font-plus">{error}</p>}
      {notice && <p className="mb-6 text-sm text-amber-700 font-plus">{notice}</p>}

      <div className="flex flex-col mb-12">
        <div className="flex justify-between items-center mb-6 border-b-2 border-on-surface pb-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Volumes List <span className="text-on-surface-variant font-body-ui text-body-ui ml-2">({files.length} files)</span></h3>
        </div>

        <div
          className={viewMode === 'grid'
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter-md'
            : 'flex flex-col gap-4'
          }
          onDragOver={(e) => {
            e.preventDefault()
            maybeAutoScroll(e.clientY)
            setContainerDropIndicator(e.clientY)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (draggedId !== null && dropIndicator?.id) {
              reorderVolumes(draggedId, dropIndicator.id, dropIndicator.position)
              setDraggedId(null)
              setDropIndicator(null)
              setDragActive(false)
            }
          }}
        >
          {files
            .slice()
            .sort((a, b) => (Number(a.volumeNo) || 0) - (Number(b.volumeNo) || 0))
            .map((f, index) => (
            <article
              key={f.id}
              draggable
              onDragStart={(e) => {
                setDraggedId(f.id)
                setDragActive(false)
                if (e.dataTransfer) {
                  const dragProxy = document.createElement('img')
                  dragProxy.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                  e.dataTransfer.setDragImage(dragProxy, 0, 0)
                }
              }}
              onDragEnd={() => {
                setDraggedId(null)
                setDropIndicator(null)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                maybeAutoScroll(e.clientY)
                if (draggedId === null) return
                const rect = e.currentTarget.getBoundingClientRect()
                const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
                setDropIndicator({ id: f.id, position })
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (draggedId !== null) {
                  const position = dropIndicator?.id === f.id ? dropIndicator.position : 'before'
                  reorderVolumes(draggedId, f.id, position)
                }
                setDropIndicator(null)
                setDragActive(false)
                setDraggedId(null)
              }}
              className={`bg-surface border-2 ${f.status==='done' ? 'border-on-surface' : 'border-dashed border-on-surface'} rounded-xl p-card-padding ${viewMode === 'list' ? 'flex-row items-center' : 'flex flex-col'} gap-4 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] relative group cursor-grab`}
            >
              {dropIndicator?.id === f.id && dropIndicator.position === 'before' && (
                <div className="absolute left-3 right-3 -top-2 h-1 rounded-full bg-[#44655b] z-30" />
              )}
              {dropIndicator?.id === f.id && dropIndicator.position === 'after' && (
                <div className="absolute left-3 right-3 -bottom-2 h-1 rounded-full bg-[#44655b] z-30" />
              )}

              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => removeFile(f.id)} aria-label="Delete volume" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border-2 border-on-surface text-error hover:bg-error-container hover:text-on-error-container transition-colors shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                  <span className="material-symbols-outlined" style={{fontSize:18}}>delete</span>
                </button>
              </div>

              {viewMode === 'list' ? (
                <div className="w-36 h-48 rounded-lg overflow-hidden border-2 border-on-surface bg-surface-container flex-shrink-0 flex items-center justify-center relative">
                  {f.coverDataUrl ? (
                    <img src={f.coverDataUrl} alt={`Volume ${index + 1} cover`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-on-surface-variant font-plus">Generating preview...</div>
                  )}
                  <div className="absolute top-2 right-2 bg-surface border border-on-surface rounded px-2 py-1 font-label-sm text-label-sm">Vol. {index + 1}</div>
                </div>
              ) : (
                <div className="w-full aspect-[3/4] bg-surface-container border-2 border-on-surface rounded-lg overflow-hidden relative flex items-center justify-center">
                  {f.coverDataUrl ? (
                    <img src={f.coverDataUrl} alt={`Volume ${index + 1} cover`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-on-surface-variant font-plus">Generating preview...</div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-surface border border-on-surface rounded px-2 py-1 font-label-sm text-label-sm">Vol. {index + 1}</div>
                  <div className="absolute left-2 right-2 bottom-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-plus opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal break-words">
                    {f.name}
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col">
                <h4 className="font-label-bold text-label-bold text-on-surface">Volume {f.volumeNo ?? index + 1}</h4>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{fileSizeMB(f.size)}{f.pageCount ? ` • ${f.pageCount} pages` : ''}</p>
              </div>

              <div className="flex gap-2 mt-2 pt-4 border-t-2 border-dashed border-on-surface">
                <button onClick={() => { setCandidate({ ...f, existingId: f.id, volumeNo: String(f.volumeNo ?? index + 1) }); }} className="flex-1 py-2 px-3 border-2 border-on-surface rounded-lg bg-surface text-on-surface font-label-bold text-label-sm text-center">Edit Cover</button>
                <button className="flex-1 py-2 px-3 border-2 border-on-surface rounded-lg bg-primary-container text-on-primary-container font-label-bold text-label-sm text-center">Drag to Reorder</button>
              </div>

              {f.status !== 'pending' && (
                <div className="mt-3">
                  <div className="text-sm mb-1">{f.status === 'uploading' ? `Uploading… ${f.progress}%` : f.status === 'done' ? 'Uploaded' : ''}</div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden border border-outline-variant">
                    <div className="h-full bg-primary" style={{ width: `${f.progress}%` }} />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t-2 border-black/10 flex justify-between items-center bg-transparent">
        <p className="font-plus font-bold text-on-surface-variant">Total size: {files.reduce((s, f) => s + f.size, 0) ? `${Math.round((files.reduce((s,f)=>s+f.size,0)/1024/1024)*10)/10} MB` : '0 MB'} / Unlimited</p>
        <div className="flex gap-4">
          <button className="py-3 px-6 rounded-xl border-2 border-black/10 bg-white text-ink-black font-plus font-bold hover:bg-gray-50 transition-colors">Save Draft</button>
          <button onClick={finishUpload} className="py-3 px-8 rounded-xl border-2 border-[#131b2e] bg-[#44655b] text-white font-plus font-bold shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:bg-[#344d45] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">Finish Uploading Series <span className="material-symbols-outlined text-xl">check_circle</span></button>
        </div>
      </div>
    </main>
  )
}
