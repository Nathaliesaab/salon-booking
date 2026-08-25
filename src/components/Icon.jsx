/**
 * Thin line icons. Emoji read as clip-art next to the serif type, so the few
 * marks the site uses are drawn instead.
 */
const PATHS = {
  scissors: 'M6 4l12 12M18 4L6 16M7.5 20.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM16.5 20.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  palette: 'M12 3a9 9 0 000 18c1.1 0 1.7-.8 1.7-1.6 0-.9-.7-1.4-.7-2.2 0-.8.6-1.4 1.5-1.4H16a5 5 0 005-5c0-4.3-4-7.8-9-7.8zM7.5 12.5a1 1 0 100-2 1 1 0 000 2zM10 8.5a1 1 0 100-2 1 1 0 000 2zM14.5 8.5a1 1 0 100-2 1 1 0 000 2z',
  leaf: 'M4 20c8 0 16-4 16-16-2 0-14 0-14 9 0 3 2 5 2 5M8 16l-4 4',
  chair: 'M7 4v7a5 5 0 0010 0V4M5 21h14M12 16v5',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  phone: 'M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.2 2 2 0 016.5 3z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pin: 'M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  check: 'M4 13l5 5L20 6',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3.5 9h17M3.5 15h17M12 3c-2.5 2.4-3.8 5.5-3.8 9s1.3 6.6 3.8 9c2.5-2.4 3.8-5.5 3.8-9S14.5 5.4 12 3z',
  hourglass: 'M7 3h10M7 21h10M7 3c0 4 5 5.5 5 9s-5 5-5 9M17 3c0 4-5 5.5-5 9s5 5 5 9',
  star: 'M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  quote: 'M9 7c-2.5 0-4 2-4 4.5S6.5 16 8.5 16c1 0 1.5-.4 1.5-.4C9.7 18 8.2 19.4 6.5 20M19 7c-2.5 0-4 2-4 4.5s1.5 4.5 3.5 4.5c1 0 1.5-.4 1.5-.4-.3 2.4-1.8 3.8-3.5 4.4',
}

export default function Icon({ name, size = 26, stroke = 1.1, ...rest }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >
      <path d={d} />
    </svg>
  )
}
