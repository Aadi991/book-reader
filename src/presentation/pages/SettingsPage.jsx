import React, { useState, useRef, useEffect } from 'react'
import AppearanceSettings from '../organisms/AppearanceSettings'
import ReadingSettings from '../organisms/ReadingSettings'
import StorageSettings from '../organisms/StorageSettings'
import AccountSettings from '../organisms/AccountSettings'

function Toggle({ checked, onChange }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="w-12 h-6 bg-surface-container-high rounded-full border-2 border-on-surface relative transition-colors" aria-hidden>
        <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 border-on-surface rounded-full transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
    </label>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState('appearance')
  const [darkMode, setDarkMode] = useState(false)
  const [accent, setAccent] = useState('green')
  const [readingFont, setReadingFont] = useState('literata')
  const [fontSize, setFontSize] = useState(18)
  const [lineSpacing, setLineSpacing] = useState('cozy')
  const [readingWidth, setReadingWidth] = useState('medium')
  const [twoFA, setTwoFA] = useState(true)
  const rightColRef = useRef(null)
  const [dangerActive, setDangerActive] = useState(false)

  useEffect(() => {
    const el = rightColRef.current
    if (!el) return

    function onScroll() {
      // Activate when user scrolled down inside the right column
      setDangerActive(el.scrollTop > 120)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="flex-1 p-section-gap max-w-6xl mx-auto w-full pt-24 md:pt-section-gap">
      <div className="mb-section-gap">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Settings</h1>
        <p className="font-body-ui text-body-ui text-on-surface-variant">Manage your reading experience and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-md">
        <div className="md:col-span-1 space-y-2">
          <button onClick={() => setTab('appearance')} className={`w-full text-left px-4 py-3 rounded-xl font-label-bold text-label-bold flex items-center gap-3 ${tab==='appearance' ? 'bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'text-on-surface-variant hover:bg-surface-container-low border-2 border-transparent'}`}>
            <span className="material-symbols-outlined">palette</span>
            Appearance
          </button>
          <button onClick={() => setTab('reading')} className={`w-full text-left px-4 py-3 rounded-xl font-label-bold text-label-bold flex items-center gap-3 ${tab==='reading' ? 'bg-primary-container text-on-primary-container border-2 border-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low border-2 border-transparent'}`}>
            <span className="material-symbols-outlined">menu_book</span>
            Reading
          </button>
          <button onClick={() => setTab('storage')} className={`w-full text-left px-4 py-3 rounded-xl font-label-bold text-label-bold flex items-center gap-3 ${tab==='storage' ? 'bg-primary-container text-on-primary-container border-2 border-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low border-2 border-transparent'}`}>
            <span className="material-symbols-outlined">sd_storage</span>
            Storage
          </button>
          <button onClick={() => setTab('account')} className={`w-full text-left px-4 py-3 rounded-xl font-label-bold text-label-bold flex items-center gap-3 ${tab==='account' ? 'bg-primary-container text-on-primary-container border-2 border-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low border-2 border-transparent'}`}>
            <span className="material-symbols-outlined">person</span>
            Account
          </button>
        </div>

        <div ref={rightColRef} className="md:col-span-3 space-y-section-gap" style={{maxHeight: 'calc(100vh - 160px)', overflowY: 'auto'}}>
          {tab === 'appearance' && (
            <AppearanceSettings darkMode={darkMode} setDarkMode={setDarkMode} accent={accent} setAccent={setAccent} readingFont={readingFont} setReadingFont={setReadingFont} fontSize={fontSize} setFontSize={setFontSize} />
          )}

          {tab === 'reading' && (
            <ReadingSettings readingFont={readingFont} fontSize={fontSize} lineSpacing={lineSpacing} setLineSpacing={setLineSpacing} readingWidth={readingWidth} setReadingWidth={setReadingWidth} />
          )}

          {tab === 'storage' && (
            <StorageSettings />
          )}

          {tab === 'account' && (
            <AccountSettings dangerActive={dangerActive} />
          )}
        </div>
      </div>
    </main>
  )
}
