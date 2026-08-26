import { Link } from 'react-router-dom'
import { DAY_NAMES } from '../lib/schedule'
import { useEffect, useState } from 'react'
import { watchSchedule } from '../lib/backend'

import { BRAND, CONTACT, LOCATIONS, POLICY } from '../lib/content'
import Icon from '../components/Icon'

const { phone: PHONE, phoneHref: PHONE_HREF, email: EMAIL } = CONTACT

/** The two ways to reach her, as tappable cards -- phone first, on purpose. */
const WAYS = [
  { ico: 'phone', label: 'Call or WhatsApp', value: PHONE, href: `tel:${PHONE_HREF}`, note: 'Fastest — she picks up between clients.' },
  { ico: 'mail', label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, note: 'For longer questions and photos of your hair.' },
]

export default function ContactPage() {
  const [schedule, setSchedule] = useState(null)
  useEffect(() => watchSchedule(setSchedule), [])

  const hours = [1, 2, 3, 4, 5, 6, 0].map((i) => ({
    name: DAY_NAMES[i],
    windows: schedule?.weekly?.[String(i)] ?? [],
  }))

  return (
    <div className="shell">
      <div className="section-head" style={{ paddingTop: '1.5rem' }}>
        <span className="eyebrow">Contact</span>
        <h1>Get in touch</h1>
        <p>
          Questions about colour, pricing, or which salon is easier to reach?
          Write to {BRAND.first} directly — she answers every message herself.
        </p>
      </div>

      <div className="contact-ways">
        {WAYS.map((w) => (
          <a className="way" key={w.label} href={w.href}>
            <span className="ico"><Icon name={w.ico} size={20} /></span>
            <span className="body">
              <span className="label">{w.label}</span>
              <span className="value">{w.value}</span>
              <span className="note">{w.note}</span>
            </span>
            <span className="go" aria-hidden="true">→</span>
          </a>
        ))}
      </div>

      <div className="section-head left" style={{ marginBottom: '1rem' }}>
        <span className="eyebrow">Where to find her</span>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)' }}>
          {LOCATIONS.length > 1 ? `${LOCATIONS.length} salons` : 'The salon'}
        </h2>
      </div>

      <div className="salon-cards">
        {LOCATIONS.map((l) => (
          <div className="salon-card" key={l.id}>
            <span className="ico"><Icon name="pin" size={20} /></span>
            <h3>{l.name}</h3>
            <p className="address">{l.address}</p>
            {l.days && <span className="chip">{l.days}</span>}
            <div className="salon-links">
              {l.mapUrl && <a href={l.mapUrl} target="_blank" rel="noreferrer">Open in maps</a>}
              <Link to="/book">Book here</Link>
            </div>
          </div>
        ))}
      </div>
      <p className="muted small" style={{ marginBottom: '1.6rem' }}>
        {BRAND.first} keeps one calendar for both, so whichever you choose, the free
        times you see are the real ones.
      </p>

      <div className="card">
        <span className="eyebrow" style={{ textAlign: 'left' }}>Opening hours</span>
        {hours.map((h) => (
          <div className="line" key={h.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '.45rem 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600 }}>{h.name}</span>
            <span className="muted">
              {h.windows.length === 0 ? 'Closed' : h.windows.map((w) => `${w.start}–${w.end}`).join(', ')}
            </span>
          </div>
        ))}
        <p className="muted small" style={{ marginTop: '.9rem' }}>
          These are {BRAND.first}&rsquo;s hours across both salons combined — she keeps one
          calendar, so a time taken at one is taken at the other. Hours can shift for
          holidays; the booking calendar always shows the real availability.
        </p>
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
      </div>

      <div className="band">
        <h2>Rather book directly?</h2>
        <p>The calendar shows every available time for the next three months.</p>
        <Link className="btn-link primary" to="/book">Book an appointment</Link>
      </div>
    </div>
  )
}
