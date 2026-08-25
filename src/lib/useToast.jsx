import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

/** `const toast = useToast(); toast('Saved.')` -- or toast('Gone.', 'bad'). */
export function useToast() {
  return useContext(ToastContext)
}

const LIFETIME_MS = 3200

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const timers = useRef(new Map())
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const toast = useCallback((message, tone = 'ok') => {
    const id = ++nextId.current
    setItems((list) => [...list, { id, message, tone }])
    timers.current.set(id, setTimeout(() => dismiss(id), LIFETIME_MS))
  }, [dismiss])

  const value = useMemo(() => toast, [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Polite, so it is announced without interrupting whatever she is doing. */}
      <div className="toaster" role="status" aria-live="polite">
        {items.map((t) => (
          <button key={t.id} className={`toast ${t.tone}`} onClick={() => dismiss(t.id)}>
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
