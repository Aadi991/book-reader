import React from 'react'

export default function AvatarCard({ avatarUrl, name, plan, onEdit }) {
  return (
    <div className="md:col-span-1 bg-surface-container-highest p-card-padding rounded-xl brutal-border brutal-shadow flex flex-col items-center justify-center relative">
      <div className="relative group cursor-pointer">
        <div className="w-32 h-32 rounded-full border-4 border-on-surface overflow-hidden bg-secondary-container mb-4">
          {avatarUrl ? (
            <img alt="Large Profile" className="w-full h-full object-cover" src={avatarUrl} />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center">U</div>
          )}
        </div>
        <button onClick={onEdit} aria-label="Edit avatar" className="absolute bottom-4 right-0 w-10 h-10 bg-[#d1f5e8] text-[#44655b] rounded-full border-2 border-black/10 flex items-center justify-center brutal-shadow group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface">{name}</h3>
      <p className="font-label-bold text-label-bold text-on-surface-variant">{plan}</p>
    </div>
  )
}
