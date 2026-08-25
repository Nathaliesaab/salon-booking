import { useEffect, useRef } from 'react'

/**
 * Native <dialog>, so focus trapping, Esc-to-close and the backdrop come from
 * the browser rather than being reimplemented badly. On a phone it sits at the
 * bottom of the screen as a sheet; on a desktop it centres.
 */
export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // Esc fires `cancel`/`close` on the element itself, not on React state.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => onClose()
    el.addEventListener('close', handler)
    return () => el.removeEventListener('close', handler)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-label={title}
      // Clicking the backdrop lands on the dialog element itself.
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="modal-x" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="modal-body">{open && children}</div>
    </dialog>
  )
}
