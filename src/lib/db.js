import {
  collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where, writeBatch, Timestamp, addDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { BUSY_STATUSES, dateKey, keyToDate } from './schedule'
import { STYLIST_UIDS } from './config'

// Built on demand rather than at import time, so this module can be imported
// safely in demo mode, where `db` is null and none of these are ever called.
const appointmentsRef = () => collection(db, 'appointments')
const servicesRef = () => collection(db, 'services')
const blackoutsRef = () => collection(db, 'blackouts')
// Personal-data-free mirror of every slot-holding appointment. Clients may read
// this to see what is taken; only the stylist may read `appointments` itself.
const busyRef = () => collection(db, 'busy')
const reviewsRef = () => collection(db, 'reviews')
const scheduleDoc = () => doc(db, 'settings', 'schedule')

export const DEFAULT_SCHEDULE = {
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

function fromDoc(snap) {
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    start: data.start?.toDate?.() ?? null,
    end: data.end?.toDate?.() ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
  }
}

/** Live feed of every appointment on one day, both pending and decided. */
export function watchDay(day, callback) {
  const startOfDay = new Date(day); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(day); endOfDay.setHours(23, 59, 59, 999)
  const q = query(
    appointmentsRef(),
    where('start', '>=', Timestamp.fromDate(startOfDay)),
    where('start', '<=', Timestamp.fromDate(endOfDay)),
    orderBy('start')
  )
  return onSnapshot(q, (snap) => callback(snap.docs.map(fromDoc)))
}

/** Live feed for the admin log: everything from `since` forward. */
export function watchAppointmentsFrom(since, callback) {
  const q = query(appointmentsRef(), where('start', '>=', Timestamp.fromDate(since)), orderBy('start'))
  return onSnapshot(q, (snap) => callback(snap.docs.map(fromDoc)))
}

export function watchServices(callback) {
  return onSnapshot(query(servicesRef(), orderBy('name')), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export function watchSchedule(callback) {
  return onSnapshot(scheduleDoc(), (snap) => callback(snap.exists() ? snap.data() : DEFAULT_SCHEDULE))
}

export function watchBlackouts(callback) {
  return onSnapshot(blackoutsRef(), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, date: keyToDate(d.id), ...d.data() })))
  )
}

export async function loadDayAppointments(day) {
  const startOfDay = new Date(day); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(day); endOfDay.setHours(23, 59, 59, 999)
  const snap = await getDocs(query(
    appointmentsRef(),
    where('start', '>=', Timestamp.fromDate(startOfDay)),
    where('start', '<=', Timestamp.fromDate(endOfDay))
  ))
  return snap.docs.map(fromDoc)
}

/** Live feed of taken slots for one day -- safe for clients to read. */
export function watchBusy(day, callback) {
  const startOfDay = new Date(day); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(day); endOfDay.setHours(23, 59, 59, 999)
  const q = query(
    busyRef(),
    where('start', '>=', Timestamp.fromDate(startOfDay)),
    where('start', '<=', Timestamp.fromDate(endOfDay))
  )
  return onSnapshot(q, (snap) => callback(snap.docs.map(fromDoc)))
}

export async function loadDayBusy(day) {
  const startOfDay = new Date(day); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(day); endOfDay.setHours(23, 59, 59, 999)
  const snap = await getDocs(query(
    busyRef(),
    where('start', '>=', Timestamp.fromDate(startOfDay)),
    where('start', '<=', Timestamp.fromDate(endOfDay))
  ))
  return snap.docs.map(fromDoc)
}

export async function requestAppointment({ client, service, start, end, notes, uid }) {
  const ref = doc(appointmentsRef())
  const batch = writeBatch(db)
  batch.set(ref, {
    clientName: client.name.trim(),
    clientPhone: client.phone.trim(),
    serviceId: service.id,
    serviceName: service.name,
    durationMin: service.durationMin,
    price: service.price ?? null,
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
    status: 'pending',
    notes: notes?.trim() || '',
    createdBy: uid,
    createdAt: serverTimestamp(),
  })
  batch.set(doc(db, 'busy', ref.id), {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
    status: 'pending',
    createdBy: uid,
  })
  await batch.commit()
  return ref
}

/**
 * Status changes have to move the `busy` mirror too: a declined or cancelled
 * appointment must release its slot, a live one must keep holding it.
 */
export async function setAppointmentStatus(id, status, extra = {}) {
  const batch = writeBatch(db)
  batch.update(doc(db, 'appointments', id), { status, ...extra })
  const busyDoc = doc(db, 'busy', id)
  if (BUSY_STATUSES.includes(status)) batch.update(busyDoc, { status })
  else batch.delete(busyDoc)
  await batch.commit()
}

export function saveSchedule(schedule) {
  return setDoc(scheduleDoc(), schedule, { merge: true })
}

export function saveService(service) {
  const { id, ...rest } = service
  return id ? setDoc(doc(db, 'services', id), rest, { merge: true }) : addDoc(servicesRef(), rest)
}

/** Newest first. Hidden reviews are filtered client-side so one query serves both sides. */
export function watchReviews(callback) {
  return onSnapshot(query(reviewsRef(), orderBy('createdAt', 'desc')), (snap) =>
    callback(snap.docs.map((d) => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() ?? null }
    }))
  )
}

export function addReview({ name, rating, text, serviceName, uid }) {
  return addDoc(reviewsRef(), {
    name: name.trim(),
    rating: Number(rating),
    text: text.trim(),
    serviceName: serviceName || '',
    hidden: false,
    createdBy: uid,
    createdAt: serverTimestamp(),
  })
}

export const setReviewHidden = (id, hidden) => updateDoc(doc(db, 'reviews', id), { hidden })
export const deleteReview = (id) => deleteDoc(doc(db, 'reviews', id))

export const deleteService = (id) => deleteDoc(doc(db, 'services', id))
export const addBlackout = (day, reason) => setDoc(doc(db, 'blackouts', dateKey(day)), { reason })
export const removeBlackout = (id) => deleteDoc(doc(db, 'blackouts', id))
/** Allowlisted UID, or a document in /admins -- same two paths as the rules. */
export async function isAdmin(uid) {
  if (STYLIST_UIDS.includes(uid)) return true
  try {
    return (await getDoc(doc(db, 'admins', uid))).exists()
  } catch {
    return false
  }
}
