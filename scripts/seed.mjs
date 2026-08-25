/**
 * One-time seed for a fresh Firebase project.
 *
 * Firestore has no empty collections -- until a document exists, the console
 * shows nothing at all, and the booking page has no services to offer. This
 * writes the opening hours and a starter service menu so both appear.
 *
 * Writing to `services` and `settings` requires the stylist account, so it
 * signs in first:
 *
 *   node scripts/seed.mjs her@email.com 'her-password'
 *
 * Safe to re-run: services are matched by name and updated, not duplicated.
 */
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  collection, doc, getDocs, getFirestore, setDoc, writeBatch,
} from 'firebase/firestore'

const SCHEDULE = {
  slotMinutes: 30,
  leadTimeHours: 2,
  weekly: {
    0: [],
    1: [{ start: '09:00', end: '18:00' }],
    2: [{ start: '09:00', end: '18:00' }],
    3: [{ start: '09:00', end: '18:00' }],
    4: [{ start: '09:00', end: '20:00' }],
    5: [{ start: '09:00', end: '20:00' }],
    6: [{ start: '10:00', end: '16:00' }],
  },
}

const SERVICES = [
  { name: 'Cut & blow dry', durationMin: 60, price: '150 AED', active: true },
  { name: 'Roots colour', durationMin: 120, price: '350 AED', active: true },
  { name: 'Balayage', durationMin: 180, price: '650 AED', active: true },
  { name: 'Blow dry', durationMin: 45, price: '90 AED', active: true },
  { name: 'Treatment', durationMin: 30, price: '120 AED', active: true },
]

function env() {
  const out = {}
  for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
    const i = line.indexOf('=')
    if (i > 0 && !line.startsWith('#')) out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return out
}

const [email, password] = process.argv.slice(2)
if (!email || !password) {
  console.error("Usage: node scripts/seed.mjs <stylist-email> '<password>'")
  process.exit(1)
}

const e = env()
const app = initializeApp({
  apiKey: e.VITE_FB_API_KEY,
  authDomain: e.VITE_FB_AUTH_DOMAIN,
  projectId: e.VITE_FB_PROJECT_ID,
  storageBucket: e.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: e.VITE_FB_SENDER_ID,
  appId: e.VITE_FB_APP_ID,
})
const db = getFirestore(app)

const { user } = await signInWithEmailAndPassword(getAuth(app), email, password)
console.log(`Signed in as ${user.email} (uid ${user.uid})`)
if (!(e.VITE_STYLIST_UIDS ?? '').split(',').map((s) => s.trim()).includes(user.uid)) {
  console.warn('! This UID is not in VITE_STYLIST_UIDS. The rules will reject these writes.')
  console.warn('  Add it there and to firestore.rules, then run: firebase deploy --only firestore:rules')
}

await setDoc(doc(db, 'settings', 'schedule'), SCHEDULE, { merge: true })
console.log('settings/schedule written')

const existing = await getDocs(collection(db, 'services'))
const byName = new Map(existing.docs.map((d) => [d.data().name, d.ref]))
const batch = writeBatch(db)
for (const s of SERVICES) {
  batch.set(byName.get(s.name) ?? doc(collection(db, 'services')), s, { merge: true })
}
await batch.commit()
console.log(`services written (${SERVICES.length})`)

console.log('\nDone. Refresh the Firestore console -- `services` and `settings` will now be listed.')
console.log('`appointments`, `busy` and `reviews` appear as soon as the first one is created.')
process.exit(0)
