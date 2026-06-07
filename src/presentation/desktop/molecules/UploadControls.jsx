import React, { useRef } from 'react'

export function UploadControls({
  queueSize,
  onFilesSelected,
  disabled
}) {
  const fileInputRef = useRef(null)

  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-[#44655b]" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
      <p className="font-plus text-sm text-on-surface-variant">Drop PDFs anywhere on this page (processed one-by-one) or</p>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="sr-only"
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="px-3 py-1.5 rounded-lg border-2 border-black/10 bg-white text-ink-black font-plus font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        browse files
      </button>

      <span className="font-plus text-xs text-on-surface-variant">Queue: {queueSize}</span>
    </div>
  )
}