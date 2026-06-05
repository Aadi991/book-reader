import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'

import { getFirestore } from 'firebase/firestore'

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
  try {
    return await signInWithPopup(auth, googleProvider)
  } catch (err) {
    console.warn('Google popup sign-in failed, falling back to redirect:', err)
    // If popup is blocked or closed, fallback to redirect. For some errors
    // (like configuration/operation-not-allowed) redirect won't help and
    // will surface the same config error — let caller handle it.
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
