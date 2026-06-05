import React, { useEffect, useState } from 'react'
import NewCollectionButton from '../molecules/NewCollectionButton'
import { navigate } from '../navigate'

export default function Sidebar({ user, onSignOut, onNewCollection }) {
  const [route, setRoute] = useState(() => window.location.pathname || '/library')

  useEffect(() => {
    function onPopState() { setRoute(window.location.pathname || '/library') }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navItems = [
    { to: '/library', icon: 'library_books', label: 'Library' },
    { to: '/continue', icon: 'play_circle', label: 'Continue Reading' },
    { to: '/downloads', icon: 'download', label: 'Downloads' },
    { to: '/bookmarks', icon: 'bookmark', label: 'Bookmarks' },
    { to: '/notes', icon: 'sticky_note_2', label: 'Notes' },
  ]

  function itemClass(isActive) {
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-container text-on-primary-container border-2 border-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`
  }

  return (
    <aside className="bg-background fixed left-0 top-0 h-full w-66 border-r-2 border-on-surface flex flex-col p-6 z-40" role="navigation" aria-label="Main">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full border-2 border-on-surface overflow-hidden shrink-0 bg-surface-variant flex items-center justify-center">
          <img alt="avatar" src={user?.photoURL || 'https://ssl.gstatic.com/accounts/ui/avatar_2x.png'} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-display-lg text-[20px] leading-[24px] font-black text-on-surface tracking-tight">Bibliophile</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Personal Reader</p>
        </div>
      </div>

      <div className="mb-8  px-1">
        <NewCollectionButton onClick={() => (onNewCollection ? onNewCollection() : onSignOut())}>New Collection</NewCollectionButton>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map(item => {
          const isActive = route === item.to
          return (
            <a key={item.to} className={itemClass(isActive)} href={item.to} onClick={(e) => { e.preventDefault(); navigate(item.to); }}>
              <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: `'FILL' 1` } : undefined}>{item.icon}</span>
              <span className="font-label-bold text-label-bold">{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <a className={itemClass(route === '/settings')} href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-bold text-label-bold">Settings</span>
        </a>
      </div>
    </aside>
  )
}
