import React from 'react'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`br-btn br-btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}
