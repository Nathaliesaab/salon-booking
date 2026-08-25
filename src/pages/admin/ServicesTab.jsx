import { useState } from 'react'
import Modal from '../../components/Modal'
import { useToast } from '../../lib/useToast'
import { deleteService, saveService } from '../../lib/backend'

const BLANK = { name: '', durationMin: 60, price: '', active: true }

export default function ServicesTab({ services }) {
  // `draft` doubles as the open/closed flag: null means no dialog.
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const toast = useToast()

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const editing = Boolean(draft.id)
      await saveService({ ...draft, durationMin: Number(draft.durationMin) })
      toast(editing ? `“${draft.name}” updated.` : `“${draft.name}” added to the menu.`)
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h2>Services</h2>
          <button className="primary" onClick={() => setDraft(BLANK)}>Add service</button>
        </div>

        {services.length === 0 && <p className="muted">None yet. Add your first one.</p>}
        {services.map((s) => (
          <div className="appt" key={s.id}>
            <div className="who">
              <strong>{s.name}</strong>
              <div className="meta">
                {s.durationMin} min{s.price ? ` · ${s.price}` : ''}
                {s.active === false ? ' · hidden from clients' : ''}
              </div>
            </div>
            <div className="row" style={{ flex: '0 0 auto' }}>
              <button onClick={() => setDraft(s)}>Edit</button>
              <button
                onClick={async () => {
                  const showing = s.active === false
                  await saveService({ ...s, active: showing })
                  toast(showing ? `“${s.name}” is visible to clients again.` : `“${s.name}” hidden from clients.`)
                }}
              >
                {s.active === false ? 'Show' : 'Hide'}
              </button>
              <button className="danger" onClick={() => setConfirmDelete(s)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit service' : 'Add a service'}
      >
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="sname">Name</label>
            <input id="sname" value={draft?.name ?? ''} required autoFocus
              onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="dur">Minutes</label>
              <input id="dur" type="number" inputMode="numeric" min="5" step="5"
                value={draft?.durationMin ?? ''} required
                onChange={(e) => setDraft({ ...draft, durationMin: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="price">Price (optional)</label>
              <input id="price" value={draft?.price ?? ''}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={() => setDraft(null)}>Cancel</button>
            <button className="primary" disabled={saving}>
              {saving ? 'Saving…' : draft?.id ? 'Save changes' : 'Add service'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete this service?"
      >
        <p>
          “{confirmDelete?.name}” will be removed from the booking page for good.
          Appointments already booked for it are not affected.
        </p>
        <p className="muted small">To take it off the menu temporarily, use Hide instead.</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => setConfirmDelete(null)}>Keep it</button>
          <button
            type="button"
            className="primary danger-solid"
            onClick={async () => {
              const name = confirmDelete.name
              await deleteService(confirmDelete.id)
              setConfirmDelete(null)
              toast(`“${name}” deleted.`, 'bad')
            }}
          >
            Delete service
          </button>
        </div>
      </Modal>
    </>
  )
}
