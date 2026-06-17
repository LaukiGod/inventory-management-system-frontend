import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Input } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--slate-900)', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8L12 3 3 8m18 0l-9 5m9-5v10l-9 5m0-10L3 8m9 5v10M3 8v10l9 5" />
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 19, fontWeight: 700 }}>Inventory</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Sign in to manage your stock</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: '#fff', borderRadius: 14, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 14,
          boxShadow: '0 20px 40px rgba(0,0,0,.3)',
        }}>
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && (
            <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} style={{ width: '100%', height: 40, marginTop: 4 }}>
            Sign in
          </Button>
        </form>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 20 }}>
          Forgot your password? Ask your admin to reset it.
        </p>
      </div>
    </div>
  )
}
