import { useEffect, useState } from 'react'
import Stars from '../../components/Stars'
import { deleteReview, setReviewHidden, watchReviews } from '../../lib/backend'

/**
 * Reviews go live the moment a guest posts one, so this is where an unfair or
 * spam post gets pulled. Hiding is reversible; deleting is not.
 */
export default function ReviewsTab() {
  const [reviews, setReviews] = useState([])
  useEffect(() => watchReviews(setReviews), [])

  if (reviews.length === 0) return <p className="muted">No reviews yet.</p>

  return (
    <div>
      {reviews.map((r) => (
        <div className="card" key={r.id} style={{ opacity: r.hidden ? .55 : 1 }}>
          <Stars value={r.rating} />
          <p style={{ marginTop: '.6rem' }}>“{r.text}”</p>
          <p className="muted small">
            {r.name}
            {r.serviceName ? ` · ${r.serviceName}` : ''}
            {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ''}
            {r.hidden ? ' · hidden' : ''}
          </p>
          <div className="row" style={{ marginTop: '.8rem' }}>
            <button onClick={() => setReviewHidden(r.id, !r.hidden)}>
              {r.hidden ? 'Show again' : 'Hide from site'}
            </button>
            <button
              className="danger"
              onClick={() => { if (confirm('Delete this review permanently?')) deleteReview(r.id) }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
