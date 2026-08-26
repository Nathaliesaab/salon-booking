import { useEffect, useMemo, useState } from 'react'
import LoginPage from './LoginPage'
import RequestsTab from './admin/RequestsTab'
import DayTab from './admin/DayTab'
import LogTab from './admin/LogTab'
import ServicesTab from './admin/ServicesTab'
import HoursTab from './admin/HoursTab'
import ReviewsTab from './admin/ReviewsTab'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import { BRAND } from '../lib/content'
import { useAuth } from '../lib/useAuth'
import { watchAppointmentsFrom, watchBlackouts, watchSchedule, watchServices } from '../lib/backend'

const LOG_WINDOW_DAYS = 120

export default function AdminPage() {
  const { user, admin, loading, signOut } = useAuth()
  const [tab, setTab] = useState('requests')
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [schedule, setSchedule] = useState(null)
  const [blackouts, setBlackouts] = useState([])

  const since = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - LOG_WINDOW_DAYS); d.setHours(0, 0, 0, 0); return d
  }, [])

  // Esc closes the drawer, matching the modals.
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  const signedIn = admin
  useEffect(() => {
    if (!signedIn) return
    const unsubs = [
      watchAppointmentsFrom(since, setAppointments),
      watchServices(setServices),
      watchSchedule(setSchedule),
      watchBlackouts(setBlackouts),
    ]
    return () => unsubs.forEach((u) => u())
  }, [signedIn, since])

  if (loading) return <div className="shell"><p className="muted">Loading…</p></div>
  if (!user || user.isAnonymous) return <LoginPage />
  if (!admin) {
    return (
      <div className="shell">
        <div className="notice bad">This account is not set up as the stylist.</div>
        <button onClick={signOut}>Sign out</button>
      </div>
    )
  }

  const pending = appointments
    .filter((a) => a.status === 'pending')
    .sort((a, b) => a.start - b.start)

  // [key, label, icon, badge] -- the same list drives the sidebar on a desktop
  // and the bottom bar on a phone, so they can never drift apart.
  const tabs = [
    ['requests', 'Requests', 'inbox', pending.length],
    ['day', 'Today', 'calendar'],
    ['log', 'Log', 'list'],
    ['services', 'Services', 'tag'],
    ['hours', 'Hours', 'clock'],
    ['reviews', 'Reviews', 'star'],
  ]
  const current = tabs.find(([key]) => key === tab)

  function go(key) {
    setTab(key)
    setNavOpen(false)
  }

  return (
    <div className="admin">
      {/* Only ever visible while the drawer is open, which is only on narrow screens. */}
      <div
        className={`admin-scrim${navOpen ? ' show' : ''}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <nav className={`admin-nav${navOpen ? ' open' : ''}`} aria-label="Admin sections">
        <div className="admin-brand">
          <span className="name">{BRAND.name}</span>
          <span className="who">{user.email}</span>
        </div>

        <div className="admin-links">
          {tabs.map(([key, label, icon, count]) => (
            <button
              key={key}
              className="admin-link"
              aria-current={tab === key ? 'page' : undefined}
              onClick={() => go(key)}
            >
              <span className="ico">
                <Icon name={icon} size={22} />
                {count > 0 && <span className="dot" aria-hidden="true" />}
              </span>
              <span className="label">{label}</span>
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          ))}
        </div>

        <button className="admin-link signout" onClick={() => setConfirmSignOut(true)}>
          <span className="ico"><Icon name="logout" size={22} /></span>
          <span className="label">Sign out</span>
        </button>
      </nav>

      <div className="admin-main">
        <header className="admin-head">
          <button
            className="ghost hamburger"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={navOpen}
          >
            <Icon name="menu" size={24} />
          </button>
          <h1>{current?.[1]}</h1>
          {tab === 'requests' && pending.length > 0 && (
            <span className="small muted">{pending.length} waiting</span>
          )}
          <button className="ghost signout-top" onClick={() => setConfirmSignOut(true)}>Sign out</button>
        </header>

        <div className="admin-body">
          {tab === 'requests' && <RequestsTab pending={pending} />}
          {tab === 'day' && <DayTab schedule={schedule} blackouts={blackouts} />}
          {tab === 'log' && <LogTab appointments={appointments} />}
          {tab === 'services' && <ServicesTab services={services} />}
          {tab === 'hours' && <HoursTab schedule={schedule} blackouts={blackouts} />}
          {tab === 'reviews' && <ReviewsTab />}
        </div>
      </div>

      <Modal open={confirmSignOut} onClose={() => setConfirmSignOut(false)} title="Sign out?">
        <p>You will need your email and password to get back into the admin.</p>
        <p className="muted small">
          The booking page keeps working for clients either way — this only signs out {user.email}.
        </p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => setConfirmSignOut(false)}>Stay signed in</button>
          <button type="button" className="primary" onClick={signOut}>Sign out</button>
        </div>
      </Modal>
    </div>
  )
}
