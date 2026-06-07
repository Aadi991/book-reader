import React, { useState } from 'react'
import { useAuth } from '../../../application/AuthProvider'
import AppearanceSettings from '../../desktop/organisms/AppearanceSettings'
import ReadingSettings from '../../desktop/organisms/ReadingSettings'
import StorageSettings from '../../desktop/organisms/StorageSettings'
import AccountSettings from '../../desktop/organisms/AccountSettings'

export default function SettingsPage() {
  const [tab, setTab] = useState('appearance')
  const [darkMode, setDarkMode] = useState(false)
  const [accent, setAccent] = useState('green')
  const [readingFont, setReadingFont] = useState('literata')
  const [fontSize, setFontSize] = useState(18)
  const [lineSpacing, setLineSpacing] = useState('cozy')
  const [readingWidth, setReadingWidth] = useState('medium')
  const { signOut } = useAuth()

  return (
    <main className="p-4 w-full pb-20 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button onClick={signOut} className="text-error text-sm font-medium">Sign Out</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {['appearance', 'reading', 'storage', 'account'].map((t) => (
          <button 
            key={t}
            onClick={() => setTab(t)} 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${tab === t ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
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
          <AccountSettings dangerActive={true} />
        )}
      </div>
    </main>
  )
}
