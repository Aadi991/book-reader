import React from 'react'

export function ViewToggleButton({
  active,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      {...props}
      aria-pressed={active}
      className={`p-2 border-2 rounded-lg transform transition-all duration-150 ${
        active
          ? 'border-on-surface bg-surface shadow-[3px_3px_0px_rgba(19,27,46,1)]'
          : 'border-on-surface bg-white'
      } hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${className}`}
    >
      {children}
    </button>
  )
}