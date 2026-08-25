/**
 * A stand-in for the Firestore layer with the exact same exported API, backed
 * by localStorage. It exists so the app can be launched, clicked through, and
 * shown to the stylist before any Firebase project exists.
 *
 * Data lives in one browser only. `resetDemo()` clears it.
 */
import { BUSY_STATUSES, dateKey, keyToDate } from './schedule'

const KEY = 'salon-demo-v1'

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

const SEED = {
  services: [
    { id: 's1', name: 'Cut & blow dry', durationMin: 60, price: '150 AED', active: true },
    { id: 's2', name: 'Roots colour', durationMin: 120, price: '350 AED', active: true },
    { id: 's3', name: 'Balayage', durationMin: 180, price: '650 AED', active: true },
    { id: 's4', name: 'Blow dry', durationMin: 45, price: '90 AED', active: true },
    { id: 's5', name: 'Treatment', durationMin: 30, price: '120 AED', active: true },
  ],
  schedule: DEFAULT_SCHEDULE,
  blackouts: [],
  appointments: [],
  reviews: [
    { id: 'r1', name: 'Rania K.', rating: 5, serviceName: 'Balayage', hidden: false,
      text: 'I have never had a colour match my brief so exactly. Nine years of salons and this is the first time I did not need to explain it twice.',
      createdAt: '2026-07-14T10:00:00.000Z' },
    { id: 'r2', name: 'Dana M.', rating: 5, serviceName: 'Cut & blow dry', hidden: false,
      text: 'Booked on my phone at midnight and it was confirmed by morning. The easiest salon I have ever dealt with.',
      createdAt: '2026-07-29T18:30:00.000Z' },
    { id: 'r3', name: 'Leen A.', rating: 5, serviceName: 'Roots colour', hidden: false,
      text: 'She talked me out of the cut I asked for and gave me a better one. I am still thanking her.',
      createdAt: '2026-08-11T15:05:00.000Z' },
  ],
}

// Dates do not survive JSON, so they are stored as ISO strings and revived.
const DATE_FIELDS = ['start', 'end', 'createdAt']

function revive(row) {
  const out = { ...row }
  for (const f of DATE_FIELDS) if (out[f]) out[f] = new Date(out[f])
  return out
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(SEED)
    const parsed = JSON.parse(raw)
    return { ...structuredClone(SEED), ...parsed }
  } catch {
    return structuredClone(SEED)
  }
}

const listeners = new Set()

function write(mutate) {
  const state = read()
  mutate(state)
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach((fn) => fn())
  return state
}

/** Subscribe `emit` to every change, and fire it once immediately. */
function subscribe(emit) {
  emit()
  listeners.add(emit)
  return () => listeners.delete(emit)
}

export function resetDemo() {
  localStorage.removeItem(KEY)
  listeners.forEach((fn) => fn())
}

const sameDay = (date) => (row) => dateKey(new Date(row.start)) === dateKey(date)

const appointments = () => read().appointments.map(revive)

/** The public, personal-data-free view -- mirrors the `busy` collection. */
const busyRows = () =>
  appointments()
    .filter((a) => BUSY_STATUSES.includes(a.status))
    .map(({ id, start, end, status, createdBy }) => ({ id, start, end, status, createdBy }))

export function watchDay(day, callback) {
  return subscribe(() => callback(appointments().filter(sameDay(day)).sort((a, b) => a.start - b.start)))
}

export function watchBusy(day, callback) {
  return subscribe(() => callback(busyRows().filter(sameDay(day))))
}

export function watchAppointmentsFrom(since, callback) {
  return subscribe(() => callback(appointments().filter((a) => a.start >= since).sort((a, b) => a.start - b.start)))
}

export function watchServices(callback) {
  return subscribe(() => callback([...read().services].sort((a, b) => a.name.localeCompare(b.name))))
}

export function watchSchedule(callback) {
  return subscribe(() => callback(read().schedule))
}

export function watchBlackouts(callback) {
  return subscribe(() => callback(read().blackouts.map((b) => ({ ...b, date: keyToDate(b.id) }))))
}

export async function loadDayAppointments(day) {
  return appointments().filter(sameDay(day))
}

export async function loadDayBusy(day) {
  return busyRows().filter(sameDay(day))
}

export async function requestAppointment({ client, service, start, end, notes, uid }) {
  const id = `a${Date.now()}${Math.floor(Math.random() * 1000)}`
  write((state) => {
    state.appointments.push({
      id,
      clientName: client.name.trim(),
      clientPhone: client.phone.trim(),
      serviceId: service.id,
      serviceName: service.name,
      durationMin: service.durationMin,
      price: service.price ?? null,
      start: start.toISOString(),
      end: end.toISOString(),
      status: 'pending',
      notes: notes?.trim() || '',
      createdBy: uid ?? 'demo',
      createdAt: new Date().toISOString(),
    })
  })
  return { id }
}

export async function setAppointmentStatus(id, status, extra = {}) {
  write((state) => {
    const row = state.appointments.find((a) => a.id === id)
    if (row) Object.assign(row, { status, ...extra })
  })
}

export async function saveSchedule(schedule) {
  write((state) => { state.schedule = { ...state.schedule, ...schedule } })
}

export async function saveService(service) {
  write((state) => {
    if (service.id) {
      const i = state.services.findIndex((s) => s.id === service.id)
      if (i >= 0) state.services[i] = { ...state.services[i], ...service }
      else state.services.push(service)
    } else {
      state.services.push({ ...service, id: `s${Date.now()}` })
    }
  })
}

export async function deleteService(id) {
  write((state) => { state.services = state.services.filter((s) => s.id !== id) })
}

export async function addBlackout(day, reason) {
  write((state) => {
    const id = dateKey(day)
    state.blackouts = [...state.blackouts.filter((b) => b.id !== id), { id, reason }]
  })
}

export async function removeBlackout(id) {
  write((state) => { state.blackouts = state.blackouts.filter((b) => b.id !== id) })
}

export function watchReviews(callback) {
  return subscribe(() =>
    callback(read().reviews.map(revive).sort((a, b) => b.createdAt - a.createdAt))
  )
}

export async function addReview({ name, rating, text, serviceName, uid }) {
  const id = `r${Date.now()}`
  write((state) => {
    state.reviews = [
      ...(state.reviews ?? []),
      {
        id,
        name: name.trim(),
        rating: Number(rating),
        text: text.trim(),
        serviceName: serviceName || '',
        hidden: false,
        createdBy: uid ?? 'demo',
        createdAt: new Date().toISOString(),
      },
    ]
  })
  return { id }
}

export async function setReviewHidden(id, hidden) {
  write((state) => {
    const row = (state.reviews ?? []).find((r) => r.id === id)
    if (row) row.hidden = hidden
  })
}

export async function deleteReview(id) {
  write((state) => { state.reviews = (state.reviews ?? []).filter((r) => r.id !== id) })
}

export async function isAdmin() { return true }
