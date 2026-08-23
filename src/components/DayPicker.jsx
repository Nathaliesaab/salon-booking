import { dateKey, formatDayLong } from '../lib/schedule'

/** A horizontal strip of the next `days` days. Simpler on a phone than a grid. */
export default function DayPicker({ value, onChange, days = 21, closedKeys = new Set() }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const options = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d
  })

  return (
    <div className="field">
      <label htmlFor="day">Day</label>
      <select
        id="day"
        value={dateKey(value)}
        onChange={(e) => onChange(options.find((d) => dateKey(d) === e.target.value))}
      >
        {options.map((d) => {
          const closed = closedKeys.has(dateKey(d))
          return (
            <option key={dateKey(d)} value={dateKey(d)} disabled={closed}>
              {formatDayLong(d)}{closed ? ' — closed' : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}
