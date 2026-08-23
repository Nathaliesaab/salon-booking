import { useState } from 'react'
import { deleteService, saveService } from '../../lib/backend'

const BLANK = { name: '', durationMin: 60, price: '', active: true }

export default function ServicesTab({ services }) {
  const [draft, setDraft] = useState(BLANK)

  async function submit(e) {
    e.preventDefault()
    await saveService({ ...draft, durationMin: Number(draft.durationMin) })
    setDraft(BLANK)
  }

  return (
    <>
      <form className="card" onSubmit={submit}>
        <h2>{draft.id ? 'Edit service' : 'Add a service'}</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="sname">Name</label>
            <input id="sname" value={draft.name} required
              onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="dur">Minutes</label>
            <input id="dur" type="number" min="5" step="5" value={draft.durationMin} required
              onChange={(e) => setDraft({ ...draft, durationMin: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="price">Price (optional)</label>
            <input id="price" value={draft.price ?? ''}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          </div>
        </div>
        <div className="row">
          <button className="primary">{draft.id ? 'Save' : 'Add'}</button>
          {draft.id && <button type="button" className="ghost" onClick={() => setDraft(BLANK)}>Cancel</button>}
        </div>
      </form>

      <div className="card">
        <h2>Services</h2>
        {services.length === 0 && <p className="muted">None yet. Add one above.</p>}
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
              <button onClick={() => saveService({ ...s, active: s.active === false })}>
                {s.active === false ? 'Show' : 'Hide'}
              </button>
              <button className="danger" onClick={() => deleteService(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
