import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import { useToast } from '../../lib/useToast'
import { addBlackout, removeBlackout, saveSchedule } from '../../lib/backend'
import { DAY_NAMES, dateKey, formatDayLong, keyToDate } from '../../lib/schedule'

/** Weekly working hours plus one-off closed days (holidays, sick days). */
export default function HoursTab({ schedule, blackouts }) {
  const [draft, setDraft] = useState(schedule)
  const toast = useToast()
  const [closing, setClosing] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setDraft(schedule) }, [schedule])
  if (!draft) return null

  function setWindow(dayIndex, field, value) {
    const weekly = { ...draft.weekly }
    const windows = [...(weekly[dayIndex] ?? [])]
    windows[0] = { start: '09:00', end: '17:00', ...windows[0], [field]: value }
    weekly[dayIndex] = windows
    setDraft({ ...draft, weekly })
  }

  function toggleDay(dayIndex, open) {
    const weekly = { ...draft.weekly }
    weekly[dayIndex] = open ? [{ start: '09:00', end: '17:00' }] : []
    setDraft({ ...draft, weekly })
  }

  async function save() {
    setSaving(true)
    try {
      await saveSchedule({
        ...draft,
        slotMinutes: Number(draft.slotMinutes),
        leadTimeHours: Number(draft.leadTimeHours),
      })
      toast('Weekly hours saved. The booking calendar is updated.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="card">
        <h2>Weekly hours</h2>
        {DAY_NAMES.map((name, i) => {
          const windows = draft.weekly?.[i] ?? draft.weekly?.[String(i)] ?? []
          const open = windows.length > 0
          return (
            <div className="row" key={name} style={{ alignItems: 'flex-end', marginBottom: '.5rem' }}>
              <label style={{ flex: '1 1 8rem', marginBottom: '.6rem' }}>
                <input type="checkbox" checked={open} style={{ width: 'auto', marginRight: '.4rem' }}
                  onChange={(e) => toggleDay(i, e.target.checked)} />
                {name}
              </label>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="time" disabled={!open} value={windows[0]?.start ?? ''}
                  onChange={(e) => setWindow(i, 'start', e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="time" disabled={!open} value={windows[0]?.end ?? ''}
                  onChange={(e) => setWindow(i, 'end', e.target.value)} />
              </div>
            </div>
          )
        })}

        <div className="row" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label htmlFor="step">Slot size (minutes)</label>
            <input id="step" type="number" min="5" step="5" value={draft.slotMinutes}
              onChange={(e) => setDraft({ ...draft, slotMinutes: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="lead">Minimum notice (hours)</label>
            <input id="lead" type="number" min="0" value={draft.leadTimeHours}
              onChange={(e) => setDraft({ ...draft, leadTimeHours: e.target.value })} />
          </div>
        </div>
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save hours'}
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Closed days</h2>
          <button className="primary" onClick={() => setClosing({ date: '', reason: '' })}>
            Mark a day closed
          </button>
        </div>

        {blackouts.length === 0 && <p className="muted small" style={{ marginTop: '.75rem' }}>None.</p>}
        {blackouts
          .slice()
          .sort((a, b) => a.date - b.date)
          .map((b) => (
            <div className="appt" key={b.id}>
              <div className="who">
                <strong>{formatDayLong(b.date)}</strong>
                {b.reason && <div className="meta">{b.reason}</div>}
              </div>
              <button
                className="danger"
                onClick={async () => {
                  await removeBlackout(b.id)
                  toast(`${formatDayLong(b.date)} is open for bookings again.`)
                }}
              >
                Reopen
              </button>
            </div>
          ))}
        <p className="small muted">Today is {formatDayLong(keyToDate(dateKey(new Date())))}.</p>
      </div>

      <Modal open={closing !== null} onClose={() => setClosing(null)} title="Mark a day closed">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const day = keyToDate(closing.date)
            await addBlackout(day, closing.reason)
            setClosing(null)
            toast(`${formatDayLong(day)} marked closed.`)
          }}
        >
          <div className="field">
            <label htmlFor="cd">Date</label>
            <input id="cd" type="date" required value={closing?.date ?? ''}
              onChange={(e) => setClosing({ ...closing, date: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="cr">Reason (optional)</label>
            <input id="cr" value={closing?.reason ?? ''}
              onChange={(e) => setClosing({ ...closing, reason: e.target.value })} />
          </div>
          <p className="muted small">
            Existing bookings on that day are not cancelled — this only stops new ones.
          </p>
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={() => setClosing(null)}>Cancel</button>
            <button className="primary" disabled={!closing?.date}>Mark closed</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
