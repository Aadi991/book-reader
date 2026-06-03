import { useEffect, useState } from 'react'
import LibraryPage from './presentation/pages/LibraryPage'
import ContinuePage from './presentation/pages/ContinuePage'
import DownloadsPage from './presentation/pages/DownloadsPage'
import SettingsPage from './presentation/pages/SettingsPage'
import UploadPage from './presentation/pages/UploadPage'
import UploadSelect from './presentation/pages/UploadSelect'
import UploadSeries from './presentation/pages/UploadSeries'
import { useAuth } from './features/auth/AuthProvider'
import LoginPage from './presentation/pages/LoginPage'
import './App.css'
import { navigate } from './navigate'

import Sidebar from './presentation/atoms/Sidebar'

function App() {
  const { user, signOut } = useAuth()
  const [route, setRoute] = useState(() => window.location.pathname || '/library')

  useEffect(() => {
    function onPopState() { setRoute(window.location.pathname || '/library') }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  

  if (!user) return <LoginPage />

  function renderRoute() {
    switch (route) {
      case '/continue': return <ContinuePage />
      case '/downloads': return <DownloadsPage />
      case '/upload': return <UploadPage user={user} />
      case '/upload/series': return <UploadSeries />
      case '/upload/select': return <UploadSelect />
      case '/settings': return <SettingsPage />
      case '/library':
      default:
        return <LibraryPage user={user} />
    }
  }

  function handleNewCollection() {
    navigate('/upload/select')
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
