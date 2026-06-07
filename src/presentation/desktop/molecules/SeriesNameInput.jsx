import React from 'react'
import TextInput from '../atoms/TextInput'

export function SeriesNameInput({
  value,
  onChange,
  error
}) {
  return (
    <TextInput
      id="seriesName"
      className={`border-2 ${
        !value.trim() && error
          ? 'border-red-500'
          : 'border-black/10'
      } bg-white text-ink-black font-plus`}
      value={value}
      onChange={onChange}
      placeholder="Enter series title"
    />
  )
}