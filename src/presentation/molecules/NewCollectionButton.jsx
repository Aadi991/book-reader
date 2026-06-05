import React from 'react'

export default function NewCollectionButton({
  onClick,
  children
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        py-3
        px-4
        rounded-xl
        border-2
        border-[#131b2e]
        bg-white
        text-[#131b2e]
        font-plus
        font-bold
        flex
        items-center
        justify-center
        gap-2
        shadow-[2px_2px_0px_0px_#131b2e]
        hover:translate-x-[2px]
        hover:translate-y-[2px]
        hover:shadow-none
        transition-all
      "
    >
      <span
        className="material-symbols-outlined text-xl"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        add
      </span>

      <span>
        {children || 'New Collection'}
      </span>
    </button>
  )
}