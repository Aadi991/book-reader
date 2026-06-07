import React from 'react'
import { CoverImage } from '../atoms/CoverImage'
import { FileSizeLabel } from '../atoms/FileSizeLabel'
import { VolumeProgress } from '../molecules/VolumeProgress'

export default function VolumeCard({
  volume,
  index,
  onEdit
}) {
  return (
    <>
      <div className="w-full aspect-[3/4] bg-surface-container border-2 border-on-surface rounded-lg overflow-hidden relative flex items-center justify-center">
        {volume.coverDataUrl ? (
          <CoverImage
            src={volume.coverDataUrl}
            alt={`Volume ${index + 1} cover`}
          />
        ) : (
          <div className="text-on-surface-variant font-plus">
            Generating preview...
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-surface border border-on-surface rounded px-2 py-1 font-label-sm text-label-sm">
          Vol. {volume.volumeNo ?? index + 1}
        </div>

        <div className="absolute left-2 right-2 bottom-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-plus opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal break-words">
          {volume.name}
        </div>
      </div>

      <div className="flex-1 flex flex-col mt-4">
        <h4 className="font-label-bold text-label-bold text-on-surface">
          Volume {volume.volumeNo ?? index + 1}
        </h4>

        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          <FileSizeLabel bytes={volume.size} />
          {volume.pageCount
            ? ` • ${volume.pageCount} pages`
            : ''}
        </p>
      </div>

      <div className="flex gap-2 mt-2 pt-4 border-t-2 border-dashed border-on-surface">
        <button
          onClick={onEdit}
          className="flex-1 py-2 px-3 border-2 border-on-surface rounded-lg bg-surface text-on-surface font-label-bold text-label-sm text-center"
        >
          Edit Cover
        </button>

        <button
          className="flex-1 py-2 px-3 border-2 border-on-surface rounded-lg bg-primary-container text-on-primary-container font-label-bold text-label-sm text-center"
        >
          Drag to Reorder
        </button>
      </div>

      {volume.status !== 'pending' && (
        <VolumeProgress
          status={
            volume.status === 'uploading'
              ? `Uploading… ${volume.progress}%`
              : volume.status === 'done'
                ? 'Uploaded'
                : ''
          }
          progress={volume.progress}
        />
      )}
    </>
  )
}