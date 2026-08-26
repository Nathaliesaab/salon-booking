import { useEffect } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import ReviewsPage from './pages/ReviewsPage'
import AdminPage from './pages/AdminPage'
import { AuthProvider } from './lib/useAuth'
import { ToastProvider } from './lib/useToast'
import DemoBanner from './components/DemoBanner'
import { BRAND, CONTACT, LOCATIONS } from './lib/content'

/**
 * A new page should start at its top. The router leaves the scroll position
 * where it was, so tapping Book halfway down the landing page used to drop you
 * into the middle of the booking form. Back and forward are left alone -- the
 * browser restores those positions itself, and stealing them is worse.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, navigationType])

  return null
}

/**
 * The admin side carries its own navigation, so the guest header and footer
 * are left off there -- on a phone the sidebar becomes a bottom bar and would
 * otherwise sit on top of the footer.
 */
function Site() {
  const isAdmin = useLocation().pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />

      {!isAdmin && (
        <header className="topbar">
          <Link to="/" className="brand">
            {BRAND.name}
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
          <span className="brand">{BRAND.name}</span>
          <p className="tagline">{BRAND.city}</p>
          {/* Both salons, so the footer answers "where is she today?" on every page. */}
          <p>{LOCATIONS.map((l) => l.name).join(' · ')}</p>
          <p>{CONTACT.phone}</p>
          <p style={{ marginTop: '1.2rem' }}>
            <Link to="/book">Book</Link> · <Link to="/reviews">Reviews</Link> · <Link to="/contact">Contact</Link> · <Link to="/admin">{BRAND.first}&rsquo;s login</Link>
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
