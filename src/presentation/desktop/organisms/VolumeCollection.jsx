import React from 'react'
import VolumeSortableItem from './VolumeSortableItem'

export default function VolumeCollection({
  files,
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
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter-md'
          : 'flex flex-col gap-4'
      }
    >
      {files
        .slice()
        .sort(
          (a, b) =>
            (Number(a.volumeNo) || 0) -
            (Number(b.volumeNo) || 0)
        )
        .map((volume, index) => (
          <VolumeSortableItem
            key={volume.id}
            volume={volume}
            index={index}
            viewMode={viewMode}
            draggedId={draggedId}
            dropIndicator={dropIndicator}
            setDropIndicator={setDropIndicator}
            setDraggedId={setDraggedId}
            setDragActive={setDragActive}
            maybeAutoScroll={maybeAutoScroll}
            reorderVolumes={reorderVolumes}
            onEdit={() => onEdit(volume)}
            onDelete={() => onDelete(volume.id)}
          />
        ))}
    </div>
  )
}