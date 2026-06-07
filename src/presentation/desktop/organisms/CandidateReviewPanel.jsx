import React from 'react'
import { FileSizeLabel } from '../atoms/FileSizeLabel'

export default function CandidateReviewPanel({
  candidate,
  candidateBusy,
  isPagePickerOpen,
  setIsPagePickerOpen,
  pageInput,
  setPageInput,
  onApplyPage,
  onAccept,
  onReject,
  setCandidate,
}) {
  return (
    <section className="mb-8 p-4 rounded-xl border-2 border-black/10 bg-white">
      <div className="flex items-start gap-4">
        <div className="w-32 h-44 rounded-lg overflow-hidden border-2 border-black/10 bg-surface-container">
          <img src={candidate.coverDataUrl} alt="Candidate cover preview" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="font-plus font-bold text-lg text-ink-black">Review Next Volume</h3>
          <p className="font-plus text-sm text-on-surface-variant mt-1 break-words">{candidate.name}</p>
          <p className="font-plus text-xs text-on-surface-variant mt-1">
            <FileSizeLabel bytes={candidate.size} /> • {candidate.pageCount} pages • Preview page {candidate.coverPage}
          </p>
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
              <button
                onClick={() => setIsPagePickerOpen(true)}
                disabled={candidateBusy}
                className="py-2 px-3 border-2 border-on-surface rounded-lg bg-surface text-on-surface font-label-bold text-label-sm text-center disabled:opacity-50"
              >
                Change Page
              </button>
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
                  onClick={() => onApplyPage(pageInput)}
                  disabled={candidateBusy}
                  className="w-10 h-10 border-2 border-[#131b2e] rounded-lg bg-[#44655b] text-white flex items-center justify-center disabled:opacity-50"
                  aria-label="Apply page"
                >
                  <span className="material-symbols-outlined text-lg">check</span>
                </button>
              </div>
            )}
            <button
              onClick={onReject}
              disabled={candidateBusy}
              className="py-2 px-3 border-2 border-black/10 rounded-lg bg-white text-ink-black font-plus font-bold text-sm disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              disabled={candidateBusy}
              className="py-2 px-3 border-2 border-[#131b2e] rounded-lg bg-[#44655b] text-white font-plus font-bold text-sm disabled:opacity-50"
            >
              Accept & Save Cover
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}