import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut,
} from 'firebase/auth'
import { auth } from './firebase'
import { configured } from './config'
import { isAdmin } from './backend'

const AuthContext = createContext(null)

// Demo mode has no real accounts. Any password unlocks the admin side so the
// app can be walked through; the real build uses Firebase Email/Password.
const DEMO_USER = { uid: 'demo-client', isAnonymous: true }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(configured ? null : DEMO_USER)
  const [admin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) return
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // Clients never sign up -- an anonymous account is enough to let the
        // rules tie a booking request to whoever created it.
        try { await signInAnonymously(auth) } catch (e) { console.error(e) }
        setLoading(false)
        return
      }
      setUser(u)
      setAdmin(u.isAnonymous ? false : await isAdmin(u.uid).catch(() => false))
      setLoading(false)
    })
  }, [])

  const value = {
    user,
    admin,
    loading,
    signIn: async (email, password) => {
      if (!configured) {
        setUser({ uid: 'demo-stylist', isAnonymous: false, email })
        setAdmin(true)
        return
      }
      return signInWithEmailAndPassword(auth, email, password)
    },
    signOut: async () => {
      if (!configured) {
        setUser(DEMO_USER)
        setAdmin(false)
        return
      }
      return signOut(auth)
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
