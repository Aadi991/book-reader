import React from 'react'
import { navigate } from '../../navigate'
import { useUploadSeries } from '../../../application/useUploadSeries'

import { SeriesNameInput } from '../molecules/SeriesNameInput'
import { UploadControls } from '../molecules/UploadControls'
import { ViewModeSwitcher } from '../molecules/ViewModeSwitcher'
import { StatusBanner } from '../molecules/StatusBanner'
import CandidateReviewPanel from '../organisms/CandidateReviewPanel'
import VolumeCollection from '../organisms/VolumeCollection'
import UploadFooter from '../organisms/UploadFooter'

export default function UploadSeries() {
  const {
    seriesName,
    setSeriesName,
    files,
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
    maybeAutoScroll,
    setDraggedId,
    setDropIndicator,
    setDragActive,
    setCandidate
  } = useUploadSeries()

  const allUploaded =
    files.length > 0 &&
    files.every(f => f.status === 'done') &&
    pendingQueue.length === 0 &&
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

      {/* Header */}
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="font-plus font-bold text-3xl text-ink-black mb-2 tracking-tight">
            Upload Series Volumes
          </h1>
          <p className="font-plus text-base text-on-surface-variant">
            Drag and drop multiple PDF files to add them to your new collection.
          </p>
          <div className="mt-4 max-w-md">
            <SeriesNameInput
              value={seriesName}
              onChange={(e) => {
                setSeriesName(e.target.value)
                if (e.target.value.trim()) {
                  setError(null)
                }
              }}
              error={error}
            />
          </div>
        </div>
        <button
          onClick={() => navigate('/upload/select')}
          className="text-on-surface-variant hover:text-ink-black flex items-center gap-1 font-plus font-bold text-sm transition-colors"
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            close
          </span>
          Cancel
        </button>
      </div>

      {/* Upload Controls & Switcher */}
      <div className="mb-8 flex items-center gap-3">
        <UploadControls
          queueSize={pendingQueue.length}
          onFilesSelected={onFilesSelected}
          disabled={!seriesName.trim()}
        />
        <ViewModeSwitcher mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Preparation Status Banner */}
      {candidateBusy && !candidate && (
        <StatusBanner>Preparing next PDF preview...</StatusBanner>
      )}

      {/* Candidate Review Panel */}
      {candidate && (
        <CandidateReviewPanel
          candidate={candidate}
          candidateBusy={candidateBusy}
          isPagePickerOpen={isPagePickerOpen}
          setIsPagePickerOpen={setIsPagePickerOpen}
          pageInput={pageInput}
          setPageInput={setPageInput}
          onApplyPage={applyCandidateCoverPage}
          onAccept={acceptCandidate}
          onReject={rejectCandidate}
          setCandidate={setCandidate}
        />
      )}

      {/* Error & Notice Status Banners */}
      {error && <StatusBanner type="error">{error}</StatusBanner>}
      {notice && <StatusBanner type="notice">{notice}</StatusBanner>}

      {/* Volume Collection */}
      <div className="flex flex-col mb-12">
        <div className="flex justify-between items-center mb-6 border-b-2 border-on-surface pb-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Volumes List{' '}
            <span className="text-on-surface-variant font-body-ui text-body-ui ml-2">
              ({files.length} files)
            </span>
          </h3>
        </div>

        <VolumeCollection
          files={files}
          viewMode={viewMode}
          draggedId={draggedId}
          dropIndicator={dropIndicator}
          setDropIndicator={setDropIndicator}
          setDraggedId={setDraggedId}
          setDragActive={setDragActive}
          maybeAutoScroll={maybeAutoScroll}
          reorderVolumes={reorderVolumes}
          onEdit={(volume) => {
            setCandidate({
              ...volume,
              existingId: volume.id,
              volumeNo: String(volume.volumeNo ?? files.indexOf(volume) + 1)
            })
          }}
          onDelete={removeFile}
        />
      </div>

      {/* Upload Footer */}
      <UploadFooter
        files={files}
        allUploaded={allUploaded}
        onSaveDraft={() => {}}
        onFinish={finishUpload}
      />
    </main>
  )
}
