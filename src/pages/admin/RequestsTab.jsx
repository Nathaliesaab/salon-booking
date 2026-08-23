import { useState } from 'react'
import AppointmentRow from '../../components/AppointmentRow'
import { loadDayAppointments, setAppointmentStatus } from '../../lib/backend'
import { findConflicts, formatTime } from '../../lib/schedule'

export default function RequestsTab({ pending }) {
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function confirm(appt) {
    setError(null); setBusyId(appt.id)
    try {
      // Re-check at confirm time: another request may have been confirmed for
      // this slot since this one came in. This is the double-booking guard.
      const sameDay = await loadDayAppointments(appt.start)
      const clashes = findConflicts(appt, sameDay.filter((a) => a.status === 'confirmed'), { ignoreId: appt.id })
      if (clashes.length > 0) {
        const c = clashes[0]
        setError(`That overlaps ${c.clientName} at ${formatTime(c.start)}. Decline one of them first.`)
        return
      }
      await setAppointmentStatus(appt.id, 'confirmed')
    } finally {
      setBusyId(null)
    }
  }

  if (pending.length === 0) {
    return <div className="card"><p className="muted">No requests waiting. You are all caught up.</p></div>
  }

  return (
    <div className="card">
      <h2>Waiting for your answer</h2>
      {error && <div className="notice bad">{error}</div>}
      {pending.map((appt) => (
        <AppointmentRow
          key={appt.id}
          appt={appt}
          showDate
          actions={
            <>
              <button className="primary" disabled={busyId === appt.id} onClick={() => confirm(appt)}>
                Confirm
              </button>
              <button className="danger" disabled={busyId === appt.id}
                onClick={() => setAppointmentStatus(appt.id, 'declined')}>
                Decline
              </button>
            </>
          }
        />
      ))}
    </div>
  )
}
