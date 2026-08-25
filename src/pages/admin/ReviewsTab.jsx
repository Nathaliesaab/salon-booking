import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import Stars from '../../components/Stars'
import { useToast } from '../../lib/useToast'
import { deleteReview, setReviewHidden, watchReviews } from '../../lib/backend'

/**
 * Reviews go live the moment a guest posts one, so this is where an unfair or
 * spam post gets pulled. Hiding is reversible; deleting is not.
 */
export default function ReviewsTab() {
  const [reviews, setReviews] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  const toast = useToast()
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
            <button
              onClick={async () => {
                await setReviewHidden(r.id, !r.hidden)
                toast(r.hidden ? `${r.name}'s review is back on the site.` : `${r.name}'s review hidden.`)
              }}
            >
              {r.hidden ? 'Show again' : 'Hide from site'}
            </button>
            <button className="danger" onClick={() => setConfirmDelete(r)}>Delete</button>
          </div>
        </div>
      ))}

      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title="Delete this review?">
        <p>{confirmDelete?.name}'s review will be gone for good — it cannot be brought back.</p>
        <p className="muted small">To take it off the site but keep it, use Hide instead.</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => setConfirmDelete(null)}>Keep it</button>
          <button
            type="button"
            className="primary danger-solid"
            onClick={async () => {
              const name = confirmDelete.name
              await deleteReview(confirmDelete.id)
              setConfirmDelete(null)
              toast(`${name}'s review deleted.`, 'bad')
            }}
          >
            Delete review
          </button>
        </div>
      </Modal>
    </div>
  )
}
