import React from 'react'
import { ViewToggleButton } from "../atoms/ViewToggleButton"

export function ViewModeSwitcher({
  mode,
  onChange
}) {
  return (
    <div className="ml-auto flex items-center gap-3">
      <ViewToggleButton
        active={mode === 'grid'}
        onClick={() => onChange('grid')}
      >
        Grid
      </ViewToggleButton>

      <ViewToggleButton
        active={mode === 'list'}
        onClick={() => onChange('list')}
      >
        List
      </ViewToggleButton>
    </div>
  )
}