import React from 'react'
import VolumeCard from './VolumeCard'
import VolumeListItem from './VolumeListItem'

export default function VolumeSortableItem({
  volume,
  index,
  viewMode,

  draggedId,
  dropIndicator,

  setDropIndicator,
  setDraggedId,
  setDragActive,

  maybeAutoScroll,
  reorderVolumes,

  onEdit,
  onDelete
}) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        setDraggedId(volume.id)
        setDragActive(false)

        if (e.dataTransfer) {
          const dragProxy = document.createElement('img')

          dragProxy.src =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

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

        maybeAutoScroll?.(e.clientY)

        if (draggedId === null) return

        const rect =
          e.currentTarget.getBoundingClientRect()

        const position =
          e.clientY < rect.top + rect.height / 2
            ? 'before'
            : 'after'

        setDropIndicator({
          id: volume.id,
          position
        })
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()

        if (draggedId !== null) {
          const position =
            dropIndicator?.id === volume.id
              ? dropIndicator.position
              : 'before'

          reorderVolumes(
            draggedId,
            volume.id,
            position
          )
        }

        setDropIndicator(null)
        setDraggedId(null)
        setDragActive(false)
      }}
      className={`bg-surface border-2 ${
        volume.status === 'done'
          ? 'border-on-surface'
          : 'border-dashed border-on-surface'
      } rounded-xl p-6 ${
        viewMode === 'list'
          ? 'block'
          : 'flex flex-col'
      } shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] relative group cursor-grab`}
    >
      {/* Drop indicators */}

      {dropIndicator?.id === volume.id &&
        dropIndicator.position === 'before' && (
          <div className="absolute left-3 right-3 -top-2 h-1 rounded-full bg-[#44655b] z-30" />
        )}

      {dropIndicator?.id === volume.id &&
        dropIndicator.position === 'after' && (
          <div className="absolute left-3 right-3 -bottom-2 h-1 rounded-full bg-[#44655b] z-30" />
        )}

      {/* Delete button */}

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onDelete}
          aria-label="Delete volume"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border-2 border-on-surface text-error hover:bg-error-container hover:text-on-error-container transition-colors shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18 }}
          >
            delete
          </span>
        </button>
      </div>

      {/* View-specific layout */}

      {viewMode === 'list' ? (
        <VolumeListItem
          volume={volume}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <VolumeCard
          volume={volume}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </article>
  )
}