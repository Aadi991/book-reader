import React from 'react'

export default function TextInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 rounded-xl ${className}`}
    />
  )
}