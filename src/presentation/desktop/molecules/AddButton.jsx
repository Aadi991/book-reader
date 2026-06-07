import React from 'react'

export default function AddButton({ onClick, label='Add' }) {
  return (
    <button onClick={onClick} className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-full border-2 border-on-surface hover:shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
      <span className="material-symbols-outlined text-[20px]">add</span>
      <span>{label}</span>
    </button>
  )
}
