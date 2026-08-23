import { useEffect, useState } from 'react'
import { addBlackout, removeBlackout, saveSchedule } from '../../lib/backend'
import { DAY_NAMES, dateKey, formatDayLong, keyToDate } from '../../lib/schedule'

/** Weekly working hours plus one-off closed days (holidays, sick days). */
export default function HoursTab({ schedule, blackouts }) {
  const [draft, setDraft] = useState(schedule)
  const [saved, setSaved] = useState(false)
  const [closeDate, setCloseDate] = useState('')
  const [closeReason, setCloseReason] = useState('')

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
    await saveSchedule({ ...draft, slotMinutes: Number(draft.slotMinutes), leadTimeHours: Number(draft.leadTimeHours) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <button className="primary" onClick={save}>Save hours</button>
        {saved && <span className="small muted" style={{ marginLeft: '.75rem' }}>Saved.</span>}
      </div>

      <div className="card">
        <h2>Closed days</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="cd">Date</label>
            <input id="cd" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cr">Reason (optional)</label>
            <input id="cr" value={closeReason} onChange={(e) => setCloseReason(e.target.value)} />
          </div>
        </div>
        <button
          disabled={!closeDate}
          onClick={async () => {
            await addBlackout(keyToDate(closeDate), closeReason)
            setCloseDate(''); setCloseReason('')
          }}
        >
          Mark closed
        </button>

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
              <button className="danger" onClick={() => removeBlackout(b.id)}>Reopen</button>
            </div>
          ))}
        <p className="small muted">Today is {formatDayLong(keyToDate(dateKey(new Date())))}.</p>
      </div>
    </>
  )
}
