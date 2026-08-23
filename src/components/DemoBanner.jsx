import { DEMO, resetDemo } from '../lib/backend'

/**
 * Only rendered when no Firebase project is configured, so nobody mistakes
 * browser-local sample data for the real thing.
 */
export default function DemoBanner() {
  if (!DEMO) return null
  return (
    <div className="shell" style={{ paddingBottom: 0 }}>
      <div className="notice small">
        <strong>Demo mode.</strong> Sample data saved in this browser only —
        nothing is shared and nothing is sent. Sign in on the stylist side with
        any email and password. Add your Firebase config to <code>.env.local</code>
        {' '}to switch to the real thing.{' '}
        <button className="ghost small" onClick={resetDemo} style={{ padding: '0 .25rem' }}>
          Reset demo data
        </button>
      </div>
    </div>
  )
}
