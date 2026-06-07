import React from 'react'
import { FileSizeLabel } from '../atoms/FileSizeLabel'

export default function UploadFooter({
  files,
  allUploaded,
  onSaveDraft,
  onFinish
}) {
  const totalSize = files.reduce(
    (sum, file) => sum + file.size,
    0
  )

  return (
    <div className="pt-6 border-t-2 border-black/10 flex justify-between items-center bg-transparent">
      <p className="font-plus font-bold text-on-surface-variant">
        Total size:{' '}
        {totalSize ? (
          <FileSizeLabel bytes={totalSize} />
        ) : (
          '0 MB'
        )}{' '}
        / Unlimited
      </p>

      <div className="flex gap-4">
        <button
          onClick={onSaveDraft}
          className="py-3 px-6 rounded-xl border-2 border-black/10 bg-white text-ink-black font-plus font-bold hover:bg-gray-50 transition-colors"
        >
          Save Draft
        </button>

        <button
          onClick={onFinish}
          disabled={!allUploaded}
          className="py-3 px-8 rounded-xl border-2 border-[#131b2e] bg-[#44655b] text-white font-plus font-bold shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:bg-[#344d45] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
        >
          Finish Uploading Series{' '}
          <span className="material-symbols-outlined text-xl">check_circle</span>
        </button>
      </div>
    </div>
  )
}