import { BrowserRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import ReviewsPage from './pages/ReviewsPage'
import AdminPage from './pages/AdminPage'
import { AuthProvider } from './lib/useAuth'
import DemoBanner from './components/DemoBanner'
import { CONTACT } from './lib/content'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
        <footer className="footer">
          <span className="brand">Belle &amp; Bloom</span>
          <p className="tagline">Hair Studio · Dubai</p>
          <p>{CONTACT.address} · {CONTACT.phone}</p>
          <p style={{ marginTop: '1.2rem' }}>
            <Link to="/book">Book</Link> · <Link to="/reviews">Reviews</Link> · <Link to="/contact">Contact</Link> · <Link to="/admin">Stylist login</Link>
          </p>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  )
}
