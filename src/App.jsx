import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import BookingPage from './pages/BookingPage'
import AdminPage from './pages/AdminPage'
import { AuthProvider } from './lib/useAuth'
import DemoBanner from './components/DemoBanner'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <header className="topbar">
          <Link to="/" className="brand" style={{ color: 'inherit', textDecoration: 'none' }}>
            Salon
          </Link>
          <Link to="/admin" className="small muted">Stylist</Link>
        </header>
        <DemoBanner />
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
