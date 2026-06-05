import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  ensurePersistence,
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut as firebaseSignOut,
  onAuthChanged
} from './firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = () => {}
    ;(async () => {
      await ensurePersistence()
      unsub = onAuthChanged((u) => {
        setUser(u)
        setLoading(false)
      })
    })()

    return () => unsub()
  }, [])

  async function signInWithGoogle() {
    setLoading(true)
    try {
      const res = await firebaseSignInWithGoogle()
      setUser(res.user)
      return res.user
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithEmailAndPassword(email, password) {
    setLoading(true)
    try {
      const res = await signUpWithEmail(email, password)
      setUser(res.user)
      return res.user
    } finally {
      setLoading(false)
    }
  }

  async function signInWithEmailAndPassword(email, password) {
    setLoading(true)
    try {
      const res = await signInWithEmail(email, password)
      setUser(res.user)
      return res.user
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setLoading(true)
    try {
      await firebaseSignOut()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmailAndPassword,
        signUpWithEmailAndPassword,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
