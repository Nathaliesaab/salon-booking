import { Link } from 'react-router-dom'
import { DAY_NAMES } from '../lib/schedule'
import { useEffect, useState } from 'react'
import { watchSchedule } from '../lib/backend'

import { CONTACT, POLICY } from '../lib/content'
import Icon from '../components/Icon'

const { phone: PHONE, phoneHref: PHONE_HREF, email: EMAIL, address: ADDRESS } = CONTACT

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
        <p>Questions about colour, pricing or what would suit your hair? Write to her directly — she answers every message herself.</p>
      </div>

      <div className="grid" style={{ marginBottom: '1.5rem' }}>
        <a className="tile" href={`tel:${PHONE_HREF}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="ico"><Icon name="phone" /></span>
          <h3>Call or WhatsApp</h3>
          <p className="muted small">{PHONE}</p>
        </a>
        <a className="tile" href={`mailto:${EMAIL}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="ico"><Icon name="mail" /></span>
          <h3>Email</h3>
          <p className="muted small">{EMAIL}</p>
        </a>
        <div className="tile">
          <span className="ico"><Icon name="pin" /></span>
          <h3>The studio</h3>
          <p className="muted small">{ADDRESS}</p>
        </div>
      </div>

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
          Hours can shift for holidays — the booking calendar always shows the real availability.
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
