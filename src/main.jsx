import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './presentation/index.css'
import './presentation/styles/ui.css'
import App from './presentation/App.jsx'
import { AuthProvider } from './application/AuthProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
