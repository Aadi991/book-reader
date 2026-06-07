import React, { useState, useEffect } from 'react'
import { StorageService, BookRepository } from '../../data'
import { navigate } from '../../navigate'
import { renderPdfCover } from '../../../application/renderPdfCover'

// We'll load PDF.js from CDN at runtime to avoid bundler resolution issues

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'

export default function BookUpload({ user, onUploaded }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [coverPage, setCoverPage] = useState(1)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [coverUploadProgress, setCoverUploadProgress] = useState(0)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('upload:cover')
      const useFlag = sessionStorage.getItem('upload:useCover')
      if (stored && useFlag === '1') {
        setCoverPreview(stored)
        sessionStorage.removeItem('upload:useCover')
      } else if (stored && !coverPreview) {
        // do not auto-set preview unless user confirmed selection
      }
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
  if (!file) return

  async function generatePreview() {
    const { blob } =
      await renderPdfCover(file)

    setCoverUrl(
      URL.createObjectURL(blob)
    )
  }

  generatePreview()
}, [file])

  async function handleUpload() {
    if (!file) return setError('Select a file first')
    if (!user || !user.uid) return setError('User must be signed in')
    setError(null)
    setUploading(true)
    try {
      const path = `${user.uid}/${file.name}`
      // upload PDF with progress
      await StorageService.uploadBookWithProgress('Books', path, file, { upsert: true }, (loaded, total) => {
        setUploadProgress(Math.round((loaded / total) * 100))
      })

      // generate and upload cover image if user generated one or choose to extract
      let coverPath = null
      if (coverPreview) {
        // coverPreview is a blob URL; convert to blob
        const resp = await fetch(coverPreview)
        const blob = await resp.blob()
        const coverFilename = `${file.name.replace(/\.pdf$/i, '')}-cover.jpg`
        const coverStoragePath = `${user.uid}/${coverFilename}`
        // upload cover with progress callback
        await StorageService.uploadBookWithProgress('Covers', coverStoragePath, blob, { upsert: true }, (loaded, total) => {
          setCoverUploadProgress(Math.round((loaded / total) * 100))
        })
        coverPath = coverStoragePath
      }

      // create a Firestore record for the book (include cover path)
      const doc = {
        title: title || file.name,
        author: author || 'Unknown',
        ownerId: user.uid,
        storagePath: path,
        coverPath: coverPath,
        coverBucket: coverPath ? 'Covers' : undefined,
        createdAt: new Date().toISOString()
      }
      await BookRepository.add(doc)
      setFile(null)
      setTitle('')
      setAuthor('')
      setUploadProgress(0)
      if (onUploaded) onUploaded()
      try {
        sessionStorage.removeItem('upload:cover')
        sessionStorage.removeItem('upload:useCover')
      } catch (e) {}
    } catch (e) {
      console.error('Upload failed', e)
      setError(e.message || String(e))
    } finally {
      setUploading(false)
    }
  }

  async function generateCover() {
    if (!file) return setError('Choose a PDF first')
    setError(null)
    try {
      const arrayBuffer = await file.arrayBuffer()

      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = pdfWorker
          s.onload = resolve
          s.onerror = reject
          document.head.appendChild(s)
        })
      }
      const pdfjsLib = window.pdfjsLib
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const pageNumber = Math.max(1, Math.min(coverPage || 1, pdf.numPages))
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      // account for device pixel ratio for crisp thumbnails
      const scale = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * scale)
      canvas.height = Math.floor(viewport.height * scale)
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`
      ctx.scale(scale, scale)
      await page.render({ canvasContext: ctx, viewport }).promise

      // revoke previous preview if it was an object URL
      if (coverPreview && coverPreview.startsWith('blob:')) {
        try { URL.revokeObjectURL(coverPreview) } catch (e) {}
      }

      // convert canvas to blob and create object URL for preview
      await new Promise((resolve) => canvas.toBlob((blob) => {
        if (!blob) return resolve()
        const blobUrl = URL.createObjectURL(blob)
        try {
          sessionStorage.setItem('upload:cover', blobUrl)
        } catch (e) {
          console.warn('Could not persist cover to sessionStorage', e)
        }
        // navigate to selection page
        navigate('/upload/select')
        resolve()
      }, 'image/jpeg', 0.85))
    } catch (e) {
      console.error('Cover generation failed', e)
      setError(e.message || String(e))
    }
  }

  return (
    <div className="mb-6 p-4 rounded-xl border-2 border-ink-black bg-surface-container">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Upload PDF</h3>
        {file ? (
          <div className="text-sm text-gray-600">{file.name} <button onClick={() => { setFile(null); setCoverPreview(null) }} className="ml-2 text-xs text-red-600">Remove</button></div>
        ) : null}
      </div>

      <label className="block">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="sr-only"
        />
        <div className="w-full border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-ink-black">
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 16V8a2 2 0 0 1 2-2h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="text-left">
                <div className="font-semibold">{file.name}</div>
                <div className="text-xs text-gray-500">{Math.round((file.size/1024)/10)/100} MB</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Click to choose a PDF or drag it here</div>
          )}
        </div>
      </label>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <input
          className="flex-1 p-2 rounded-md border"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="flex-1 p-2 rounded-md border"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
        <label className="flex items-center gap-2 text-sm">
          <span>Page:</span>
          <input
            type="number"
            min={1}
            value={coverPage}
            onChange={(e) => setCoverPage(parseInt(e.target.value || '1'))}
            className="w-20 p-2 rounded-md border"
          />
        </label>

        <div className="ml-auto flex gap-2">
          <button onClick={generateCover} className="px-3 py-2 rounded-md border-2 border-ink-black bg-white text-ink-black font-semibold text-sm" type="button" disabled={!file}>
            Generate cover
          </button>
          <button onClick={handleUpload} disabled={uploading || !file} className={`px-4 py-2 rounded-md font-semibold text-sm ${uploading || !file ? 'opacity-50 cursor-not-allowed' : 'bg-primary text-on-primary border-2 border-ink-black'}`}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      {coverPreview ? (
        <div className="mt-4 flex items-start gap-4">
          <img src={coverPreview} alt="cover preview" className="w-36 h-auto rounded-md shadow-[0_6px_0_rgba(0,0,0,0.06)]" />
          <div className="flex-1">
            <div className="font-semibold mb-1">Cover preview</div>
            {coverUploadProgress > 0 ? <div className="text-sm text-gray-600">Cover upload: {coverUploadProgress}%</div> : <div className="text-sm text-gray-600">Ready to upload with the PDF</div>}
          </div>
        </div>
      ) : null}

      {uploadProgress > 0 ? (
        <div className="mt-4">
          <div className="text-sm mb-1">Upload progress: {uploadProgress}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      ) : null}

      {error ? <div className="text-red-600 mt-3">{error}</div> : null}
    </div>
  )
}
