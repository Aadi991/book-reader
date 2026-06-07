import React from 'react'
import { CoverImage } from '../atoms/CoverImage'
import { FileSizeLabel } from '../atoms/FileSizeLabel'
import { VolumeProgress } from '../molecules/VolumeProgress'

export default function VolumeListItem({
  volume,
  onEdit,
  onDelete
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-32 flex-shrink-0">
        <div className="aspect-[3/4] overflow-hidden rounded-lg border-2 border-on-surface">
          <CoverImage
            src={volume.coverDataUrl}
            alt={volume.name}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl">
            Volume {volume.volumeNo}
          </h3>

          <span className="px-2 py-1 text-xs rounded bg-surface-container">
            {volume.pageCount} pages
          </span>
        </div>

        <p className="mt-2 truncate text-on-surface-variant">
          {volume.name}
        </p>

        <p className="mt-1 text-sm text-on-surface-variant">
          <FileSizeLabel bytes={volume.size} />
        </p>

        <VolumeProgress
          status={volume.status === 'done' ? 'Uploaded' : 'Uploading...'}
          progress={volume.progress}
        />
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          className="h-10 px-4 rounded-lg border-2 border-on-surface"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="h-10 px-4 rounded-lg border-2 border-red-500 text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  )
}