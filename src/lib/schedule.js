// Pure scheduling logic -- no Firebase in here, so it can be reasoned about
// (and tested) on its own.

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const BUSY_STATUSES = ['pending', 'confirmed']

/** "2026-08-23" for a local Date (not UTC -- avoids the off-by-one-day trap). */
export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Local Date at midnight from a "2026-08-23" key. */
export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Combine a day and a "HH:mm" string into a local Date. */
export function atTime(day, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(day)
  d.setHours(h, m, 0, 0)
  return d
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDayLong(date) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

/** Two [start, end) intervals overlap? Back-to-back bookings do not. */
export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

/**
 * Every slot that could hold `durationMin` of work on `day`.
 * Returns [{ start, end, available, reason }] so the UI can grey out taken
 * slots instead of hiding them -- clients find that less confusing.
 */
export function buildSlots({ day, schedule, busy = [], durationMin, now = new Date() }) {
  if (!schedule) return []
  const windows = schedule.weekly?.[String(day.getDay())] ?? []
  const step = schedule.slotMinutes ?? 30
  const leadMs = (schedule.leadTimeHours ?? 0) * 3600000
  const earliest = new Date(now.getTime() + leadMs)

  const slots = []
  for (const window of windows) {
    const windowStart = atTime(day, window.start)
    const windowEnd = atTime(day, window.end)
    for (let start = windowStart; addMinutes(start, durationMin) <= windowEnd; start = addMinutes(start, step)) {
      const end = addMinutes(start, durationMin)
      let reason = null
      if (start < earliest) reason = 'too soon'
      else if (busy.some((b) => overlaps(start, end, b.start, b.end))) reason = 'booked'
      slots.push({ start, end, available: !reason, reason })
    }
  }
  return slots.sort((a, b) => a.start - b.start)
}

/**
 * Conflict check used before writing. The client runs it to filter slots and
 * the admin runs it again at confirm time, because a pending request can go
 * stale between when it was made and when it is approved.
 */
export function findConflicts(candidate, appointments, { ignoreId } = {}) {
  return appointments.filter(
    (a) =>
      a.id !== ignoreId &&
      BUSY_STATUSES.includes(a.status) &&
      overlaps(candidate.start, candidate.end, a.start, a.end)
  )
}

/**
 * Could this day hold any appointment at all? Used by the calendar to grey out
 * days before the (much more expensive) per-day slot query runs.
 */
export function isDayOpen(day, schedule, closedKeys = new Set(), now = new Date()) {
  if (!schedule) return false
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  if (day < today) return false
  if (closedKeys.has(dateKey(day))) return false
  const windows = schedule.weekly?.[String(day.getDay())] ?? []
  return windows.length > 0
}

/** Morning / Afternoon / Evening — slots read better on a phone when grouped. */
export function partOfDay(date) {
  const h = date.getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}
