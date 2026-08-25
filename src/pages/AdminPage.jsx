import { useEffect, useMemo, useState } from 'react'
import LoginPage from './LoginPage'
import RequestsTab from './admin/RequestsTab'
import DayTab from './admin/DayTab'
import LogTab from './admin/LogTab'
import ServicesTab from './admin/ServicesTab'
import HoursTab from './admin/HoursTab'
import ReviewsTab from './admin/ReviewsTab'
import { useAuth } from '../lib/useAuth'
import { watchAppointmentsFrom, watchBlackouts, watchSchedule, watchServices } from '../lib/backend'

const LOG_WINDOW_DAYS = 120

export default function AdminPage() {
  const { user, admin, loading, signOut } = useAuth()
  const [tab, setTab] = useState('requests')
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [schedule, setSchedule] = useState(null)
  const [blackouts, setBlackouts] = useState([])

  const since = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - LOG_WINDOW_DAYS); d.setHours(0, 0, 0, 0); return d
  }, [])

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

  const tabs = [
    ['requests', 'Requests', pending.length],
    ['day', 'Day'],
    ['log', 'Log'],
    ['services', 'Services'],
    ['hours', 'Hours'],
    ['reviews', 'Reviews'],
  ]

  return (
    <div className="shell wide">
      <div className="tabs">
        {tabs.map(([key, label, count]) => (
          <button key={key} aria-selected={tab === key} onClick={() => setTab(key)}>
            {label}{count > 0 && <span className="badge">{count}</span>}
          </button>
        ))}
        <button className="ghost" onClick={signOut}>Sign out</button>
      </div>

      {tab === 'requests' && <RequestsTab pending={pending} />}
      {tab === 'day' && <DayTab schedule={schedule} blackouts={blackouts} />}
      {tab === 'log' && <LogTab appointments={appointments} />}
      {tab === 'services' && <ServicesTab services={services} />}
      {tab === 'hours' && <HoursTab schedule={schedule} blackouts={blackouts} />}
      {tab === 'reviews' && <ReviewsTab />}
    </div>
  )
}
