import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthProvider'
import StorageService from '../application/StorageService'
import SeriesRepository from '../data/SeriesRepository'


import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'

let pdfJsPromise = null

import { loadPdfJs } from './utils/loadPdfJs'


function dataUrlToBlob(dataUrl) {
  const [meta, data] = dataUrl.split(',')
  const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function fileSizeMB(bytes) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`
}

export function useUploadSeries() {
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
  const [seriesId, setSeriesId] = useState(null)

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

  if (!seriesName.trim()) {
    return
  }

  if (draggedId === null) {
    setDragActive(true)
  }
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
    const arr = Array.from(list || [])
      .filter(
        (f) =>
          f.type === 'application/pdf' ||
          f.name.toLowerCase().endsWith('.pdf')
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      )

    if (arr.length === 0) {
      setNotice('No PDF files selected')
      return
    }

    setPendingQueue((prev) => [...prev, ...arr])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)

    if (!seriesName.trim()) {
      setError('Please enter a series name before dropping files.')
      return
    }

    if (e.dataTransfer?.files?.length > 0) {
      onFilesSelected(e.dataTransfer.files)

      try {
        e.dataTransfer.clearData()
      } catch {
        // ignore
      }
    }
  }

  function handleDragOver(e) {
    e.preventDefault()

    if (!seriesName.trim()) {
      return
    }

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
    const seriesSlug = (seriesName || 'series').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const fileSlug = (candidate.name || 'untitled').toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/g, '-')
    const coverPath = `${seriesSlug}/vol-${parsedVolumeNo}-${fileSlug}.jpg`
    const bookPath = `${seriesSlug}/vol-${parsedVolumeNo}-${fileSlug}.pdf`
    const blob = dataUrlToBlob(candidate.coverDataUrl)

    if (candidate.existingId) {
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
  if (!uploadQueue.length) return

  const item = uploadQueue[0]

  processingRef.current = true

  ;(async () => {
    try {
      console.log('PROCESSING ITEM', item)

      setFiles(prev =>
        prev.map(f =>
          f.id === item.id
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        )
      )

      await StorageService.uploadBookWithProgress(
        'Covers',
        item.coverPath,
        item.coverBlob,
        { upsert: true },
        (loaded, total) => {
          const pct = Math.round((loaded / total) * 30)

          setFiles(prev =>
            prev.map(f =>
              f.id === item.id
                ? { ...f, progress: Math.min(30, pct) }
                : f
            )
          )
        }
      )

      setFiles(prev =>
        prev.map(f =>
          f.id === item.id
            ? { ...f, coverPath: item.coverPath }
            : f
        )
      )

      await StorageService.uploadBookWithProgress(
        'Books',
        item.bookPath,
        item.file,
        { upsert: true },
        (loaded, total) => {
          const pct = Math.round((loaded / total) * 70)

          setFiles(prev =>
            prev.map(f =>
              f.id === item.id
                ? { ...f, progress: 30 + Math.min(70, pct) }
                : f
            )
          )
        }
      )

      const doc = {
        title: item.file?.name || `Volume ${item.id}`,
        author: 'Unknown',
        ownerId: user?.uid || null,
        storagePath: item.bookPath,
        coverPath: item.coverPath,
        coverBucket: 'Covers',
        createdAt: new Date().toISOString()
      }

      console.log('Creating Firestore document')
      console.log(doc)

      let activeSeriesId = seriesId

      if (!activeSeriesId) {
        activeSeriesId = await SeriesRepository.createSeries({
          name: seriesName,
          ownerId: user?.uid || null,
          createdAt: new Date().toISOString()
        })

        setSeriesId(activeSeriesId)
      }

      await SeriesRepository.addVolume(
        activeSeriesId,
        item.id,
        {
          volumeNo: Number(
            files.find(f => f.id === item.id)?.volumeNo || 0
          ),
          title: item.file?.name,
          storagePath: item.bookPath,
          coverPath: item.coverPath,
          createdAt: new Date().toISOString()
        }
      )

      setFiles(prev =>
        prev.map(f =>
          f.id === item.id
            ? {
                ...f,
                status: 'done',
                progress: 100,
                bookPath: item.bookPath
              }
            : f
        )
      )
    } catch (e) {
      console.error('UPLOAD FAILED', e)

      setFiles(prev =>
        prev.map(f =>
          f.id === item.id
            ? { ...f, status: 'error', progress: 0 }
            : f
        )
      )

      setNotice(
        `Upload failed for ${item.id}: ${e?.message || String(e)}`
      )
    } finally {
      setUploadQueue(prev => prev.slice(1))
      processingRef.current = false
    }
  })()
}, [uploadQueue, user])

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

  function finishUpload() {
  navigate('/library')
  }

  return {
    seriesName,
    setSeriesName,
    files,
    setFiles,
    viewMode,
    setViewMode,
    pendingQueue,
    setPendingQueue,
    candidate,
    candidateBusy,
    isPagePickerOpen,
    setIsPagePickerOpen,
    pageInput,
    setPageInput,
    dragActive,
    draggedId,
    dropIndicator,
    error,
    setError,
    notice,
    inputRef,
    onFilesSelected,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    applyCandidateCoverPage,
    acceptCandidate,
    rejectCandidate,
    reorderVolumes,
    removeFile,
    setContainerDropIndicator,
    maybeAutoScroll,
    setDraggedId,
    setDropIndicator,
    setDragActive,
    finishUpload,
    setCandidate,
    setNotice
  }
}
