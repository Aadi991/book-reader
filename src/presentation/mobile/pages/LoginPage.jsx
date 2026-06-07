import React, { useState } from 'react'
import { useAuth } from '../../../application/AuthProvider'
import Input from '../../desktop/atoms/Input'
import Card from '../../desktop/atoms/Card'
import '../../styles/ui.css'

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmailAndPassword, signUpWithEmailAndPassword, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [registering, setRegistering] = useState(false)

  async function handleEmailSignIn(e) {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmailAndPassword(email, password)
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('user-not-found')) {
        setError('No account found for this email.')
      } else if (code.includes('wrong-password')) {
        setError('Incorrect password.')
      } else {
        setError(err.message || 'Failed to sign in')
      }
    }
  }

  async function handleGoogle() {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('configuration-not-found') || code.includes('operation-not-allowed')) {
        setError('Google sign-in is not enabled or the app config is missing. Check Firebase Authentication settings and authorized domains.')
      } else if (code.includes('popup-blocked') || code.includes('popup-closed-by-user')) {
        setError('Popup blocked or closed. Try allowing popups or use a different browser.')
      } else {
        setError(err.message || 'Google sign-in failed')
      }
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    try {
      await signUpWithEmailAndPassword(email, password)
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('operation-not-allowed')) {
        setError('Email/password sign-in is disabled in Firebase Authentication settings.')
      } else if (code.includes('invalid-email')) {
        setError('Invalid email address.')
      } else if (code.includes('weak-password')) {
        setError('Password is too weak.')
      } else {
        setError(err.message || 'Failed to create account')
      }
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-hero">
          <div style={{width:72,height:72,borderRadius:22,background:'#e5e0cc',border:'2px solid rgba(0,0,0,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span className="material-symbols-outlined text-[#625f4f] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          </div>
          <h1>Welcome back</h1>
          <p>Your personal library and annotations are waiting for you.</p>
        </div>

        <div style={{marginTop:18}}>
          <button className="br-btn-google" type="button" onClick={handleGoogle} disabled={loading}>
            <span className="g-icon" aria-hidden>
              <svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.5-37.2-4.7-55.1H272.1v104.4h147.5c-6.4 34.6-26.3 63.9-56.1 83.4v69.4h90.5c52.9-48.7 83.5-120.6 83.5-202.1z"/>
                <path fill="#34A853" d="M272.1 544.3c74.4 0 136.8-24.6 182.4-66.8l-90.5-69.4c-25.1 16.8-57.2 26.9-91.9 26.9-70.7 0-130.7-47.6-152.1-111.6H27.3v70.6C72.9 486.1 167.6 544.3 272.1 544.3z"/>
                <path fill="#FBBC05" d="M120 323.4c-10.6-31.7-10.6-65.9 0-97.6V155.2H27.3C-3.1 210.6-3.1 333.7 27.3 389.1L120 323.4z"/>
                <path fill="#EA4335" d="M272.1 107.6c39.6 0 75.3 13.6 103.3 40.3l77.4-77.4C410.2 24.3 347.8 0 272.1 0 167.6 0 72.9 58.2 27.3 155.2l92.7 70.6c21.4-64 81.4-111.6 152.1-111.6z"/>
              </svg>
            </span>
            Continue with Google
          </button>

          <div className="divider-row">
            <hr />
            <div className="or">OR EMAIL</div>
            <hr />
          </div>

          <form onSubmit={registering ? handleRegister : handleEmailSignIn}>
            <div>
              <label className="field-label">Email address</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>

            <div style={{marginTop:12}}>
              <label className="field-label">Password <span style={{float:'right'}}><a className="forgot-link" href="#">Forgot?</a></span></label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className="sign-in-btn" type="submit" disabled={loading}>
              {registering ? 'Create account' : 'Sign In'}
            </button>
          </form>

          {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}

          <a
            className="create-account"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setRegistering((r) => !r)
            }}
          >
            {registering ? 'Back to sign in' : 'New here? Create an account'}
          </a>
        </div>
      </Card>
    </div>
  )
}
