import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './presentation/index.css'
import './presentation/styles/ui.css'
import DesktopApp from './presentation/desktop/App.jsx'
import MobileApp from './presentation/mobile/App.jsx'
import { AuthProvider } from './application/AuthProvider'
import OfflineSyncService from './data/persistence/OfflineSyncService'

// Start draining the offline write queue whenever the network is available.
// This runs immediately and also re-runs on every 'online' event.
OfflineSyncService.startListening()

function MainApp() {
  const isMobile = window.innerWidth <= 768 // simple mobile check

  return (
    <AuthProvider>
      {isMobile ? <MobileApp /> : <DesktopApp />}
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
