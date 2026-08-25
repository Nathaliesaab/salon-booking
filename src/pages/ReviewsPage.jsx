import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Stars from '../components/Stars'
import Icon from '../components/Icon'
import { useAuth } from '../lib/useAuth'
import { addReview, watchReviews, watchServices } from '../lib/backend'

const MAX = 1000

export default function ReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', rating: 0, serviceName: '', text: '' })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [posted, setPosted] = useState(false)

  useEffect(() => watchReviews(setReviews), [])
  useEffect(() => watchServices((list) => setServices(list.filter((s) => s.active !== false))), [])

  const visible = useMemo(() => reviews.filter((r) => !r.hidden), [reviews])
  const average = visible.length
    ? (visible.reduce((sum, r) => sum + (r.rating || 0), 0) / visible.length).toFixed(1)
    : null

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (!form.rating) { setError('Please choose a star rating.'); return }
    if (!form.text.trim()) { setError('Please write a few words about your visit.'); return }
    setSaving(true)
    try {
      await addReview({ ...form, uid: user?.uid })
      setForm({ name: '', rating: 0, serviceName: '', text: '' })
      setPosted(true)
    } catch (err) {
      console.error(err)
      setError('Could not post your review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="shell">
      <div className="section-head" style={{ paddingTop: '1.5rem' }}>
        <span className="eyebrow">Reviews</span>
        <h1>What guests say</h1>
        {average && (
          <p className="rating-summary">
            <Stars value={Math.round(average)} size={18} />
            <span><b>{average}</b> from {visible.length} review{visible.length === 1 ? '' : 's'}</span>
          </p>
        )}
      </div>

      <div className="card">
        <span className="eyebrow" style={{ textAlign: 'left' }}>Leave a review</span>
        {posted && (
          <div className="notice">
            <Icon name="check" size={16} /> Thank you — your review is live below.
          </div>
        )}
        {error && <div className="notice bad">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Your rating</label>
            <Stars value={form.rating} size={30} onChange={(rating) => setForm({ ...form, rating })} />
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="rname">Your name</label>
              <input id="rname" value={form.name} required maxLength={79} autoComplete="name"
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="rservice">Service (optional)</label>
              <select id="rservice" value={form.serviceName}
                onChange={(e) => setForm({ ...form, serviceName: e.target.value })}>
                <option value="">Not saying</option>
                {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="rtext">How was your visit?</label>
            <textarea id="rtext" rows="4" value={form.text} required maxLength={MAX}
              onChange={(e) => setForm({ ...form, text: e.target.value })} />
            <p className="muted small" style={{ marginTop: '.4rem' }}>{MAX - form.text.length} characters left</p>
          </div>
          <button className="primary" type="submit" disabled={saving}>
            {saving ? 'Posting…' : 'Post review'}
          </button>
        </form>
      </div>

      <div className="review-list">
        {visible.length === 0 && <p className="muted center">No reviews yet — yours would be the first.</p>}
        {visible.map((r) => (
          <article className="review" key={r.id}>
            <Stars value={r.rating} />
            <p>“{r.text}”</p>
            <footer>
              <span className="who">{r.name}</span>
              {r.serviceName && <span className="tag">{r.serviceName}</span>}
              {r.createdAt && (
                <span className="when">
                  {new Date(r.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </span>
              )}
            </footer>
          </article>
        ))}
      </div>

      <div className="center" style={{ marginTop: '2.5rem' }}>
        <Link className="btn-link" to="/book">Book an appointment</Link>
      </div>
    </div>
  )
}
