import { useEffect, useState } from 'react'
import { useAuth } from '../../application/AuthProvider'
import { navigate } from '../navigate'
import '../App.css'

import LibraryPage from './pages/LibraryPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import ReaderPage from './pages/ReaderPage'
import SeriesPage from './pages/SeriesPage'

export default function MobileApp() {
  const { user } = useAuth()
  const [route, setRoute] = useState(() => window.location.pathname || '/library')

  useEffect(() => {
    function onPopState() { setRoute(window.location.pathname || '/library') }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (!user) return <LoginPage />

  if (route.includes('/reader/book')) {
    const bookId = route.split('/').pop()
    return <ReaderPage userId={user.uid} bookId={bookId} />
  }

  if (route.includes('/reader/series')) {
    const seriesId = route.split('/').pop()
    return <SeriesPage userId={user.uid} seriesId={seriesId} />
  }

  function renderRoute() {
    switch (route) {
      case '/settings': return <SettingsPage />
      case '/library':
      default:
        return <LibraryPage userId={user.uid} />
    }
  }

  return (
    <div className="mobile-app-root pb-24 bg-[var(--bg)] min-h-screen">
      <div className="min-h-screen">
        {renderRoute()}
      </div>
      <BottomNav route={route} />
    </div>
  )
}

function BottomNav({ route }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] flex justify-around p-2 pb-safe z-50">
      <button 
        onClick={() => navigate('/library')} 
        className={`flex flex-col items-center p-2 rounded-xl w-16 ${route === '/library' || route === '/' ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}
      >
        <span className="material-symbols-outlined">{route === '/library' || route === '/' ? 'book' : 'menu_book'}</span>
        <span className="text-xs mt-1">Library</span>
      </button>
      <button 
        onClick={() => navigate('/settings')} 
        className={`flex flex-col items-center p-2 rounded-xl w-16 ${route === '/settings' ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}
      >
        <span className="material-symbols-outlined">settings</span>
        <span className="text-xs mt-1">Settings</span>
      </button>
    </div>
  )
}
