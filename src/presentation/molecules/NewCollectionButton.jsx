import React from 'react'

export default function NewCollectionButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="w-full py-3 px-4 rounded-xl border-2 border-[#131b2e] bg-white text-[#131b2e] font-plus font-bold shadow-[4px_4px_0px_0px_#131b2e] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
      <span>{children || 'New Collection'}</span>
    </button>
  )
}
