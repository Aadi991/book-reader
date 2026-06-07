import React from 'react'

function fileSizeMB(bytes) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`
}

export function FileSizeLabel({ bytes }) {
  return <>{fileSizeMB(bytes)}</>
}