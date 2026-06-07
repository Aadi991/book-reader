import { useEffect, useState } from 'react'
import LibraryPage from './pages/LibraryPage'
import ContinuePage from './pages/ContinuePage'
import DownloadsPage from './pages/DownloadsPage'
import SettingsPage from './pages/SettingsPage'
import BookUpload from './pages/BookUpload'
import UploadSelect from './pages/UploadSelect'
import UploadSeries from './pages/UploadSeries'
import { useAuth } from '../../application/AuthProvider'
import LoginPage from './pages/LoginPage'
import '../App.css'
import { navigate } from '../navigate'
import ReaderPage from './pages/ReaderPage'
import SeriesPage from './pages/SeriesPage'

import Sidebar from './organisms/Sidebar'

function App() {
  const { user, signOut } = useAuth()
  const [route, setRoute] = useState(() => window.location.pathname || '/library')

  useEffect(() => {
    function onPopState() { setRoute(window.location.pathname || '/library') }
    console.log("hi")
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  

  if (!user) return <LoginPage />

  function renderRoute() {
    switch (route) {
      case '/continue': return <ContinuePage />
      case '/downloads': return <DownloadsPage />
      case '/upload': return <BookUpload/>
      case '/upload/series': return <UploadSeries />
      case '/upload/select': return <UploadSelect />
      case '/settings': return <SettingsPage />
      case '/library':
      default:
        return <LibraryPage userId={user.uid} />
    }
  }

  function handleNewCollection() {
    navigate('/upload/select')
  }

  if (route.includes('/reader/book')) {
    const bookId = route.split('/').pop()
    return  <ReaderPage userId={user.uid} bookId={bookId} />
  
  }

  if (route.includes('/reader/series')) {
    const seriesId = route.split('/').pop()
    return  <SeriesPage userId={user.uid} seriesId={seriesId} />
      
  }

  return (
    <div className="app-root">
      <Sidebar user={user} onSignOut={signOut} onNewCollection={handleNewCollection} />

      <div className="min-h-screen ml-64">
        {renderRoute()}
      </div>
    </div>
  )
}

export default App
