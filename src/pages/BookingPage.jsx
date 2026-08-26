import { useEffect, useMemo, useState } from 'react'
import Calendar from '../components/Calendar'
import Icon from '../components/Icon'
import { BRAND, CONTACT, LOCATIONS, POLICY, findLocation } from '../lib/content'
import { useAuth } from '../lib/useAuth'
import {
  loadDayBusy, requestAppointment, watchBlackouts, watchBusy,
  watchSchedule, watchServices,
} from '../lib/backend'
import {
  buildSlots, dateKey, findConflicts, formatDayLong, formatTime, isDayOpen, partOfDay,
} from '../lib/schedule'

const STEPS = ['Service', 'Salon', 'Day', 'Time', 'Details']

// One salon needs no choosing; the step only appears when there are two.
const ONE_LOCATION = LOCATIONS.length < 2

export default function BookingPage() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [schedule, setSchedule] = useState(null)
  const [blackouts, setBlackouts] = useState([])
  const [day, setDay] = useState(null)
  const [busy, setBusy] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [locationId, setLocationId] = useState(ONE_LOCATION ? (LOCATIONS[0]?.id ?? '') : '')
  const [slot, setSlot] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  useEffect(() => watchServices((list) => setServices(list.filter((s) => s.active !== false))), [])
  useEffect(() => watchSchedule(setSchedule), [])
  useEffect(() => watchBlackouts(setBlackouts), [])
  useEffect(() => { if (day) return watchBusy(day, setBusy) }, [day])

  const closedKeys = useMemo(() => new Set(blackouts.map((b) => b.id)), [blackouts])
  const service = services.find((s) => s.id === serviceId) ?? null
  const location = findLocation(locationId)

  // First open day is pre-selected so the calendar never opens on a dead end.
  useEffect(() => {
    if (day || !schedule) return
    const start = new Date(); start.setHours(0, 0, 0, 0)
    for (let i = 0; i < 90; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i)
      if (isDayOpen(d, schedule, closedKeys)) { setDay(d); return }
    }
  }, [schedule, closedKeys, day])

  // `busy` already holds only pending and confirmed slots, so two clients
  // cannot both ask for the same time and leave her to find the clash later.
  const slots = useMemo(() => {
    if (!service || !schedule || !day || closedKeys.has(dateKey(day))) return []
    return buildSlots({ day, schedule, busy, durationMin: service.durationMin })
  }, [service, schedule, busy, day, closedKeys])

  // Slots grouped by part of day — a flat wall of 20 times is hard to scan on a phone.
  const groups = useMemo(() => {
    const out = []
    for (const s of slots) {
      const label = partOfDay(s.start)
      const last = out[out.length - 1]
      if (last && last.label === label) last.items.push(s)
      else out.push({ label, items: [s] })
    }
    return out.filter((g) => g.items.some((s) => s.available))
  }, [slots])

  // A slot that was free when it was rendered may not be free now.
  useEffect(() => { setSlot(null) }, [serviceId, day])

  const step = !service ? 0 : !location ? 1 : !day ? 2 : !slot ? 3 : 4

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (!service || !slot || !location) return
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
        client: form, service, location, start: slot.start, end: slot.end,
        notes: form.notes, uid: user?.uid,
      })
      setDone({ ...slot, serviceName: service.name, location })
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
        <div className="card success">
          <span className="mark-ico"><Icon name="check" size={40} /></span>
          <span className="eyebrow">Request received</span>
          <h1>Thank you</h1>
          <p className="when">
            {done.serviceName}<br />
            {formatDayLong(done.start)} at {formatTime(done.start)}
            {done.location && <><br />{done.location.name} — {done.location.address}</>}
          </p>
          <p className="muted small" style={{ maxWidth: '26rem', margin: '0 auto 1.6rem' }}>
            This time is held for you while {BRAND.first} reviews it. You will hear back
            to confirm — nothing is final until then.
          </p>
          <p className="muted small" style={{ maxWidth: '26rem', margin: '0 auto 1.6rem' }}>
            Please cancel at least a day ahead if your plans change, and let {BRAND.first}
            know on {CONTACT.phone} if you are running late — after 20 minutes the slot is
            offered to someone else.
          </p>
          <button className="primary" onClick={() => setDone(null)}>Book another appointment</button>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <div className="section-head" style={{ paddingTop: '1rem', marginBottom: '1.2rem' }}>
        <span className="eyebrow">Appointments</span>
        <h1>Find your time</h1>
        <p className="muted small">A few steps. Every request is confirmed by {BRAND.first} personally.</p>
      </div>

      <div className="steps" aria-hidden="true">
        {STEPS.map((label, i) => (
          <div className={`step${i === step ? ' on' : ''}${i < step ? ' done' : ''}`} key={label}>
            {label}
          </div>
        ))}
      </div>

      {error && <div className="notice bad">{error}</div>}

      <form onSubmit={submit}>
        {/* 1 — service */}
        <div className="card">
          <label>1 · Service</label>
          <div className="choice-list">
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                className="choice"
                aria-pressed={serviceId === s.id}
                onClick={() => setServiceId(s.id)}
              >
                <span>
                  <span className="name">{s.name}</span>
                  <span className="sub">{s.durationMin} minutes</span>
                </span>
                {s.price && <span className="price">{s.price}</span>}
              </button>
            ))}
            {services.length === 0 && <p className="muted small">No services listed yet.</p>}
          </div>
        </div>

        {/* 2 — salon */}
        {!ONE_LOCATION && (
          <div className="card">
            <label>2 · Salon</label>
            <p className="muted small" style={{ marginTop: 0 }}>
              {BRAND.first} works from both. The free times are the same either way — this
              just tells her where to meet you.
            </p>
            <div className="choice-list">
              {LOCATIONS.map((l) => (
                <button
                  type="button"
                  key={l.id}
                  className="choice"
                  aria-pressed={locationId === l.id}
                  onClick={() => setLocationId(l.id)}
                >
                  <span>
                    <span className="name">{l.name}</span>
                    <span className="sub">{l.address}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3 — day */}
        <div className="card">
          <label>3 · Day</label>
          <Calendar value={day} onChange={setDay} schedule={schedule} closedKeys={closedKeys} />
        </div>

        {/* 3 — time */}
        <div className="card">
          <label>4 · Time{day ? ` — ${formatDayLong(day)}` : ''}</label>
          {!service && <p className="muted small">Choose a service first and her free times will appear here.</p>}
          {service && !day && <p className="muted small">Choose a day above.</p>}
          {service && day && groups.length === 0 && (
            <p className="muted small">Nothing free on this day. Please try another — days with availability are marked with a dot.</p>
          )}
          {service && day && groups.map((g) => (
            <div key={g.label}>
              <div className="slot-group-label">{g.label}</div>
              <div className="slots">
                {g.items.map((s) => (
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
          ))}
        </div>

        {/* 4 — details */}
        <div className="card">
          <label>5 · Your details</label>
          <div className="row">
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" value={form.name} required autoComplete="name"
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} required
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="notes">Anything {BRAND.first} should know? (optional)</label>
            <textarea id="notes" rows="2" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="card policy">
          <span className="eyebrow" style={{ textAlign: 'left' }}>Booking policy</span>
          <ul className="policy-list">
            {POLICY.map((p) => (
              <li key={p.text}>
                <span className="ico"><Icon name={p.ico} size={20} /></span>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
          <p className="muted small" style={{ margin: 0 }}>
            Need to change something? Call or WhatsApp{' '}
            <a href={`tel:${CONTACT.phoneHref}`}>{CONTACT.phone}</a>.
          </p>
        </div>

        <div className="summary">
          <div className="line"><span className="muted">Service</span><b>{service ? service.name : '—'}</b></div>
          {!ONE_LOCATION && (
            <div className="line"><span className="muted">Salon</span><b>{location ? location.name : '—'}</b></div>
          )}
          <div className="line">
            <span className="muted">When</span>
            <b>{slot ? `${formatDayLong(slot.start)}, ${formatTime(slot.start)}` : '—'}</b>
          </div>
          <button className="primary big" type="submit" disabled={!slot || !location || submitting}>
            {submitting ? 'Sending…' : 'Request this time'}
          </button>
        </div>
      </form>
    </div>
  )
}
