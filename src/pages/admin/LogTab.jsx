import { useMemo, useState } from 'react'
import AppointmentRow from '../../components/AppointmentRow'
import { formatDayLong } from '../../lib/schedule'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'declined', 'cancelled']

/** The running log she asked for -- everything, newest day first, searchable. */
export default function LogTab({ appointments }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase()
    const rows = appointments
      .filter((a) => filter === 'all' || a.status === filter)
      .filter((a) => !term ||
        a.clientName?.toLowerCase().includes(term) ||
        a.clientPhone?.includes(term) ||
        a.serviceName?.toLowerCase().includes(term) ||
        a.locationName?.toLowerCase().includes(term))
      .sort((a, b) => b.start - a.start)

    const byDay = new Map()
    for (const row of rows) {
      const key = formatDayLong(row.start)
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key).push(row)
    }
    return [...byDay.entries()]
  }, [appointments, filter, q])

  return (
    <div className="card">
      <div className="field">
        <label htmlFor="q">Search name, phone, service, or salon</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="tabs">
        {FILTERS.map((f) => (
          <button key={f} aria-selected={filter === f} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {groups.length === 0 && <p className="muted">Nothing matches.</p>}
      {groups.map(([dayLabel, rows]) => (
        <section key={dayLabel} style={{ marginTop: '1rem' }}>
          <h2 className="small muted">{dayLabel}</h2>
          {rows.map((a) => <AppointmentRow key={a.id} appt={a} />)}
        </section>
      ))}
    </div>
  )
}
