import React from 'react'
import { useState } from 'react'
import { navigate } from '../navigate'
import { useUploadSeries } from '../../application/useUploadSeries'


import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'

let pdfJsPromise = null



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
  const {
    seriesName,
    setSeriesName,
    files,
    setFiles,
    viewMode,
    setViewMode,
    pendingQueue,
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
    finishUpload,
    setContainerDropIndicator,
    maybeAutoScroll,
    setDraggedId,
    setDropIndicator,
    setDragActive,
    setCandidate,
    setNotice
  } = useUploadSeries()

  const allUploaded =
    files.length > 0 &&
    files.every(f => f.status === 'done') &&
    pendingQueue.length === 0 &&
    !uploadQueue &&
    !processingRef.current &&
    !candidate

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
            <input
              id="seriesName"
              className={`w-full px-4 py-2.5 rounded-xl border-2 ${
                !seriesName.trim() && error
                  ? 'border-red-500'
                  : 'border-black/10'
              } bg-white text-ink-black font-plus`}
              value={seriesName}
              onChange={(e) => {
                setSeriesName(e.target.value)

                if (e.target.value.trim()) {
                  setError(null)
                }
              }}
              placeholder="Enter series title"
              
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
        <button
          onClick={() => inputRef.current?.click()}
          disabled={!seriesName.trim()}
          className="px-3 py-1.5 rounded-lg border-2 border-black/10 bg-white text-ink-black font-plus font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          browse files
        </button>
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
                className={`bg-surface border-2 ${f.status === 'done' ? 'border-on-surface' : 'border-dashed border-on-surface'} rounded-xl p-card-padding ${viewMode === 'list' ? 'flex-row items-center' : 'flex flex-col'} gap-4 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] relative group cursor-grab`}
              >
                {dropIndicator?.id === f.id && dropIndicator.position === 'before' && (
                  <div className="absolute left-3 right-3 -top-2 h-1 rounded-full bg-[#44655b] z-30" />
                )}
                {dropIndicator?.id === f.id && dropIndicator.position === 'after' && (
                  <div className="absolute left-3 right-3 -bottom-2 h-1 rounded-full bg-[#44655b] z-30" />
                )}

                <div className="absolute top-4 right-4 z-10">
                  <button onClick={() => removeFile(f.id)} aria-label="Delete volume" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border-2 border-on-surface text-error hover:bg-error-container hover:text-on-error-container transition-colors shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
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
        <p className="font-plus font-bold text-on-surface-variant">Total size: {files.reduce((s, f) => s + f.size, 0) ? `${Math.round((files.reduce((s, f) => s + f.size, 0) / 1024 / 1024) * 10) / 10} MB` : '0 MB'} / Unlimited</p>
        <div className="flex gap-4">
          <button className="py-3 px-6 rounded-xl border-2 border-black/10 bg-white text-ink-black font-plus font-bold hover:bg-gray-50 transition-colors">Save Draft</button>
          <button onClick={finishUpload} disabled={!allUploaded} className="py-3 px-8 rounded-xl border-2 border-[#131b2e] bg-[#44655b] text-white font-plus font-bold shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:bg-[#344d45] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">Finish Uploading Series <span className="material-symbols-outlined text-xl">check_circle</span></button>
        </div>
      </div>
    </main>
  )
}
