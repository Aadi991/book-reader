import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'

import { getFirestore } from 'firebase/firestore'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Validate required config early so runtime error is more informative
const missingKeys = []
if (!firebaseConfig.apiKey) missingKeys.push('VITE_FIREBASE_API_KEY')
if (!firebaseConfig.authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN')
if (!firebaseConfig.projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID')
if (!firebaseConfig.appId) missingKeys.push('VITE_FIREBASE_APP_ID')

if (missingKeys.length) {
  const msg =
    'Missing Firebase config keys: ' +
    missingKeys.join(', ') +
    '\nMake sure your .env or environment provides these Vite variables.'
  console.error(msg)
  throw new Error(msg)
}

let app
try {
  app = initializeApp(firebaseConfig)
} catch (e) {
  console.error('Failed to initialize Firebase app:', e)
  throw e
}

const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

let mobileLoginResolver = null
let mobileLoginRejecter = null

if (window.Capacitor) {
  App.addListener('appUrlOpen', async (data) => {
    try {
      console.log('App opened with URL:', data.url)
      const url = new URL(data.url)
      if (url.host === 'callback' || url.pathname.includes('callback')) {
        const token = url.searchParams.get('token')
        if (token) {
          const credential = GoogleAuthProvider.credential(token)
          const userCredential = await signInWithCredential(auth, credential)
          if (mobileLoginResolver) {
            mobileLoginResolver(userCredential)
          }
        } else {
          if (mobileLoginRejecter) {
            mobileLoginRejecter(new Error('No authentication token found in callback URL.'))
          }
        }
      }
    } catch (err) {
      console.error('Error handling deep link:', err)
      if (mobileLoginRejecter) {
        mobileLoginRejecter(err)
      }
    } finally {
      try {
        await Browser.close()
      } catch (e) {
        console.error('Error closing browser:', e)
      }
      mobileLoginResolver = null
      mobileLoginRejecter = null
    }
  })
}

export async function ensurePersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence)
  } catch (e) {
    // fallback: ignore — browser will manage session
    console.error('Failed to set persistence', e)
  }
}

// Try popup first; if popup is blocked or fails with popup-related error,
// fall back to redirect flow so auth can continue.
export async function signInWithGoogle() {
  if (window.electronAPI && window.electronAPI.isElectron) {
    try {
      const { token } = await window.electronAPI.googleLogin()
      const credential = GoogleAuthProvider.credential(token)
      return await signInWithCredential(auth, credential)
    } catch (err) {
      console.error('Electron Google Sign-In failed:', err)
      throw err
    }
  }

  if (window.Capacitor) {
    return new Promise(async (resolve, reject) => {
      mobileLoginResolver = resolve
      mobileLoginRejecter = reject

      let finishedListener
      try {
        finishedListener = await Browser.addListener('browserFinished', () => {
          if (mobileLoginRejecter) {
            mobileLoginRejecter(new Error('Sign-in cancelled by user.'))
          }
          if (finishedListener) finishedListener.remove()
          mobileLoginResolver = null
          mobileLoginRejecter = null
        })
      } catch (e) {
        console.error('Could not add browserFinished listener:', e)
      }

      const authUrl = `https://book-reader-e882b.firebaseapp.com/login-bridge.html?redirect_uri=com.bookreader.mobile://callback`
      try {
        await Browser.open({ url: authUrl })
      } catch (err) {
        if (finishedListener) finishedListener.remove()
        mobileLoginResolver = null
        mobileLoginRejecter = null
        reject(err)
      }
    })
  }

  try {
    return await signInWithPopup(auth, googleProvider)
  } catch (err) {
    console.warn('Google popup sign-in failed, falling back to redirect:', err)
    try {
      await signInWithRedirect(auth, googleProvider)
    } catch (redirectErr) {
      console.error('Google redirect sign-in also failed:', redirectErr)
      throw redirectErr
    }
  }
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function signOut() {
  return firebaseSignOut(auth)
}

export function onAuthChanged(cb) {
  return onAuthStateChanged(auth, cb)
}

export { auth }
export { app }
export { db }
