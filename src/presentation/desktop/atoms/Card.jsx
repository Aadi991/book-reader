import React from 'react'

export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`br-card ${className}`} {...props}>
      {children}
    </div>
  )
}
