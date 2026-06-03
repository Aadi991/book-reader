import React from 'react'

export default function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`br-btn br-btn-${variant}`} {...props}>
      {children}
    </button>
  )
}
