import React from 'react'
import { ProgressBar } from '../atoms/ProgressBar'

export function VolumeProgress({
  status,
  progress
}) {
  return (
    <div className="mt-3">
      <div className="text-sm mb-1">{status}</div>
      <ProgressBar progress={progress} />
    </div>
  )
}
