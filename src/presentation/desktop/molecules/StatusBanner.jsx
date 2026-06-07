import React from 'react'

export function StatusBanner({
  type,
  children
}) {
  if (type === 'error') {
    return <p className="mb-6 text-sm text-red-600 font-plus">{children}</p>
  }
  if (type === 'warning' || type === 'notice') {
    return <p className="mb-6 text-sm text-amber-700 font-plus">{children}</p>
  }
  return (
    <div className="mb-6 p-4 rounded-xl border-2 border-black/10 bg-white font-plus text-sm text-on-surface-variant">
      {children}
    </div>
  )
}