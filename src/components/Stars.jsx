/** Read-only rating, or a keyboard-accessible radio group when `onChange` is given. */
export default function Stars({ value = 0, onChange, size = 16, label = 'Rating' }) {
  const stars = [1, 2, 3, 4, 5]

  if (!onChange) {
    return (
      <span className="stars" aria-label={`${value} out of 5`}>
        {stars.map((n) => (
          <svg key={n} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
            fill={n <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2"
            strokeLinejoin="round">
            <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
          </svg>
        ))}
      </span>
    )
  }

  return (
    <div className="stars-input" role="radiogroup" aria-label={label}>
      {stars.map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= value ? 'on' : ''}
          onClick={() => onChange(n)}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
            fill={n <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2"
            strokeLinejoin="round">
            <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
