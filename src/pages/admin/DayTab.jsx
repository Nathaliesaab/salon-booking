import { useEffect, useMemo, useState } from 'react'
import AppointmentRow from '../../components/AppointmentRow'
import DayPicker from '../../components/DayPicker'
import { setAppointmentStatus, watchDay } from '../../lib/backend'
import { BUSY_STATUSES, buildSlots, dateKey, formatTime } from '../../lib/schedule'

/** Her working view: one day at a time, with the gaps visible. */
export default function DayTab({ schedule, blackouts }) {
  const [day, setDay] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [appts, setAppts] = useState([])

  useEffect(() => watchDay(day, setAppts), [day])

  const closedKeys = useMemo(() => new Set(blackouts.map((b) => b.id)), [blackouts])
  const booked = appts.filter((a) => BUSY_STATUSES.includes(a.status))
  const free = useMemo(
    () => buildSlots({ day, schedule, busy: booked, durationMin: schedule?.slotMinutes ?? 30 })
      .filter((s) => s.available),
    [day, schedule, booked]
  )

  return (
    <div className="card">
      <DayPicker value={day} onChange={setDay} closedKeys={closedKeys} />
      {closedKeys.has(dateKey(day)) && <div className="notice">Marked closed.</div>}

      {booked.length === 0
        ? <p className="muted">Nothing booked.</p>
        : booked.map((appt) => (
          <AppointmentRow
            key={appt.id}
            appt={appt}
            actions={
              <>
                {appt.status === 'confirmed' && (
                  <button onClick={() => setAppointmentStatus(appt.id, 'completed')}>Mark done</button>
                )}
                <button className="danger" onClick={() => setAppointmentStatus(appt.id, 'cancelled')}>
                  Cancel
                </button>
              </>
            }
          />
        ))}

      <p className="small muted" style={{ marginTop: '1rem' }}>
        {free.length === 0
          ? 'No free gaps left this day.'
          : `Free: ${free.slice(0, 12).map((s) => formatTime(s.start)).join(', ')}${free.length > 12 ? '…' : ''}`}
      </p>
    </div>
  )
}
