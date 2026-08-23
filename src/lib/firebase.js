import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { configured } from './config'

// Values come from .env.local (see .env.example). The Firebase web config is
// not a secret -- access is controlled by firestore.rules.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
}

// In demo mode these stay null and nothing in db.js is ever called.
export const app = configured ? initializeApp(firebaseConfig) : null
export const auth = configured ? getAuth(app) : null
export const db = configured ? getFirestore(app) : null
