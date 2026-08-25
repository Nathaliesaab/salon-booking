import { useState } from 'react'
import AppointmentRow from '../../components/AppointmentRow'
import Modal from '../../components/Modal'
import { loadDayAppointments, setAppointmentStatus } from '../../lib/backend'
import { findConflicts, formatDayLong, formatTime } from '../../lib/schedule'
import { useToast } from '../../lib/useToast'

export default function RequestsTab({ pending }) {
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [declining, setDeclining] = useState(null)
  const toast = useToast()

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
      toast(`${appt.clientName} confirmed for ${formatDayLong(appt.start)} at ${formatTime(appt.start)}.`)
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
                onClick={() => setDeclining(appt)}>
                Decline
              </button>
            </>
          }
        />
      ))}

      <Modal open={declining !== null} onClose={() => setDeclining(null)} title="Decline this request?">
        <p>
          {declining?.clientName} asked for {declining?.serviceName} on{' '}
          {declining && formatDayLong(declining.start)} at {declining && formatTime(declining.start)}.
        </p>
        <p className="muted small">
          The slot is released straight away. She is not told automatically — call
          {declining?.clientPhone ? ` ${declining.clientPhone}` : ' her'} if you want to explain.
        </p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => setDeclining(null)}>Keep it</button>
          <button
            type="button"
            className="primary danger-solid"
            onClick={async () => {
              const name = declining.clientName
              await setAppointmentStatus(declining.id, 'declined')
              setDeclining(null)
              toast(`${name}'s request declined and the slot freed.`, 'bad')
            }}
          >
            Decline request
          </button>
        </div>
      </Modal>
    </div>
  )
}
