import React from 'react'

export function ProgressBar({ progress }) {
  return (
    <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
      <div
        className="h-full bg-primary"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}