import { useEffect, useMemo, useState } from 'react'
import DayPicker from '../components/DayPicker'
import { useAuth } from '../lib/useAuth'
import {
  loadDayBusy, requestAppointment, watchBlackouts, watchBusy,
  watchSchedule, watchServices,
} from '../lib/backend'
import {
  buildSlots, dateKey, findConflicts, formatDayLong, formatTime,
} from '../lib/schedule'

export default function BookingPage() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [schedule, setSchedule] = useState(null)
  const [blackouts, setBlackouts] = useState([])
  const [day, setDay] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [busy, setBusy] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [slot, setSlot] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  useEffect(() => watchServices((list) => setServices(list.filter((s) => s.active !== false))), [])
  useEffect(() => watchSchedule(setSchedule), [])
  useEffect(() => watchBlackouts(setBlackouts), [])
  useEffect(() => watchBusy(day, setBusy), [day])

  const closedKeys = useMemo(() => new Set(blackouts.map((b) => b.id)), [blackouts])
  const service = services.find((s) => s.id === serviceId) ?? null

  // `busy` already holds only pending and confirmed slots, so two clients
  // cannot both ask for the same time and leave her to find the clash later.
  const slots = useMemo(() => {
    if (!service || !schedule || closedKeys.has(dateKey(day))) return []
    return buildSlots({ day, schedule, busy, durationMin: service.durationMin })
  }, [service, schedule, busy, day, closedKeys])

  // A slot that was free when it was rendered may not be free now.
  useEffect(() => { setSlot(null) }, [serviceId, day])

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (!service || !slot) return
    setSubmitting(true)
    try {
      // Re-read the day immediately before writing -- the live listener can lag
      // behind another client who is submitting at the same moment.
      const fresh = await loadDayBusy(day)
      if (findConflicts(slot, fresh).length > 0) {
        setError('Someone just took that time. Please pick another slot.')
        setSlot(null)
        return
      }
      await requestAppointment({
        client: form, service, start: slot.start, end: slot.end,
        notes: form.notes, uid: user?.uid,
      })
      setDone({ ...slot, serviceName: service.name })
      setForm({ name: '', phone: '', notes: '' })
      setSlot(null)
    } catch (err) {
      console.error(err)
      setError('Could not send the request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="shell">
        <div className="card">
          <h1>Request sent</h1>
          <p>
            {done.serviceName} on {formatDayLong(done.start)} at {formatTime(done.start)}.
          </p>
          <p className="muted">
            This time is held for you while she reviews it. You will hear back to
            confirm — nothing is final until then.
          </p>
          <button className="primary" onClick={() => setDone(null)}>Book another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <h1>Book an appointment</h1>
      <p className="muted">Pick a service and a time. She confirms every request.</p>

      {error && <div className="notice bad">{error}</div>}

      <form className="card" onSubmit={submit}>
        <div className="field">
          <label htmlFor="service">Service</label>
          <select id="service" value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
            <option value="">Choose a service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.durationMin} min{s.price ? ` · ${s.price}` : ''}
              </option>
            ))}
          </select>
        </div>

        <DayPicker value={day} onChange={setDay} closedKeys={closedKeys} />

        {!service && <p className="muted small">Choose a service to see available times.</p>}

        {service && closedKeys.has(dateKey(day)) && <p className="muted">Closed this day.</p>}

        {service && !closedKeys.has(dateKey(day)) && (
          slots.length === 0
            ? <p className="muted">No times available on this day. Try another.</p>
            : (
              <div className="field">
                <label>Time</label>
                <div className="slots">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s.start.toISOString()}
                      className="slot"
                      disabled={!s.available}
                      aria-pressed={slot?.start.getTime() === s.start.getTime()}
                      onClick={() => setSlot(s)}
                    >
                      {formatTime(s.start)}
                      {!s.available && <span className="why">{s.reason}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )
        )}

        <div className="row">
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" value={form.phone} required
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="notes">Anything she should know? (optional)</label>
          <textarea id="notes" rows="2" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button className="primary" type="submit" disabled={!slot || submitting}>
          {submitting ? 'Sending…' : 'Request this time'}
        </button>
      </form>
    </div>
  )
}
