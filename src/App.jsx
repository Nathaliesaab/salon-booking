import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import ReviewsPage from './pages/ReviewsPage'
import AdminPage from './pages/AdminPage'
import { AuthProvider } from './lib/useAuth'
import { ToastProvider } from './lib/useToast'
import DemoBanner from './components/DemoBanner'
import { CONTACT } from './lib/content'

/**
 * The admin side carries its own navigation, so the guest header and footer
 * are left off there -- on a phone the sidebar becomes a bottom bar and would
 * otherwise sit on top of the footer.
 */
function Site() {
  const isAdmin = useLocation().pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && (
        <header className="topbar">
          <Link to="/" className="brand">
            Belle &amp; Bloom
            <small>Hair Studio</small>
          </Link>
          <nav className="nav">
            <NavLink to="/" end className="nav-hide">Home</NavLink>
            <NavLink to="/reviews" className="nav-hide">Reviews</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/book" className="cta">Book</NavLink>
          </nav>
        </header>
      )}

      <DemoBanner />

      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdmin && (
        <footer className="footer">
          <span className="brand">Belle &amp; Bloom</span>
          <p className="tagline">Hair Studio · Dubai</p>
          <p>{CONTACT.address} · {CONTACT.phone}</p>
          <p style={{ marginTop: '1.2rem' }}>
            <Link to="/book">Book</Link> · <Link to="/reviews">Reviews</Link> · <Link to="/contact">Contact</Link> · <Link to="/admin">Stylist login</Link>
          </p>
        </footer>
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Site />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
