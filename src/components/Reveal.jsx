import { useEffect, useRef, useState } from 'react'

/**
 * Fades its content up the first time it scrolls into view, and then stops
 * watching -- content that re-animates every time you scroll past is a
 * distraction, not a flourish.
 *
 * It renders the element you ask for rather than wrapping one, so it can carry
 * an existing class (`.tile`, `.quote`) without disturbing any grid or flex
 * layout around it. `delay` staggers siblings.
 *
 * If the browser has no IntersectionObserver, or the visitor asked for reduced
 * motion, everything simply starts visible.
 */
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!el || still || typeof IntersectionObserver === 'undefined') { setShown(true); return }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShown(true)
      io.disconnect()
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? ' in' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
