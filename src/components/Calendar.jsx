import { useMemo, useState } from 'react'
import { dateKey, isDayOpen } from '../lib/schedule'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1) }

/**
 * Month grid. Big touch targets, one tap to pick a day, closed days struck
 * through rather than hidden so nobody wonders where Sunday went.
 */
export default function Calendar({ value, onChange, schedule, closedKeys = new Set(), monthsAhead = 3 }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [cursor, setCursor] = useState(() => startOfMonth(value ?? today))

  const first = startOfMonth(cursor)
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ]

  const limit = startOfMonth(new Date(today.getFullYear(), today.getMonth() + monthsAhead, 1))
  const canPrev = first > startOfMonth(today)
  const canNext = first < limit

  function shift(months) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + months, 1))
  }

  return (
    <div className="calendar">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">‹</button>
        <span className="title">{cursor.toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
        <button type="button" className="cal-nav" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month">›</button>
      </div>

      <div className="cal-grid" role="grid">
        {DOW.map((d, i) => <div className="cal-dow" key={i} aria-hidden="true">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div className="cal-day empty" key={`e${i}`} />
          const open = isDayOpen(d, schedule, closedKeys, today)
          const selected = value && dateKey(value) === dateKey(d)
          const isToday = dateKey(d) === dateKey(today)
          return (
            <button
              type="button"
              key={dateKey(d)}
              className={`cal-day${isToday ? ' today' : ''}`}
              disabled={!open}
              aria-pressed={!!selected}
              aria-label={`${d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}${open ? '' : ' — closed'}`}
              onClick={() => onChange(d)}
            >
              {d.getDate()}
              <span className="mark" aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <div className="cal-legend">
        <span><i />Open for bookings</span>
        <span style={{ textDecoration: 'line-through' }}>Closed</span>
      </div>
    </div>
  )
}
