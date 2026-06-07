import React from 'react'

export function CoverImage({
  src,
  alt
}) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
    />
  )
}