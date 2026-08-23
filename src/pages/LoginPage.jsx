import { useState } from 'react'
import { useAuth } from '../lib/useAuth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null); setBusy(true)
    try {
      await signIn(email, password)
    } catch {
      setError('Wrong email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shell">
      <h1>Stylist sign in</h1>
      <form className="card" onSubmit={submit}>
        {error && <div className="notice bad">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} required
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} required
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
