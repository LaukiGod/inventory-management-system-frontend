import { useState, FormEvent } from 'react'
import { api } from '../../api/client'
import { PageHeader, Button, Input, Card } from '../../components/ui'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

export default function Settings() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await api.users.changePassword(newPassword)
      toast('Password changed successfully')
      setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account" />

      <Card style={{ padding: 20, maxWidth: 420, marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Account</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>{user?.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{user?.email}</div>
      </Card>

      <Card style={{ padding: 20, maxWidth: 420 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 14 }}>Change password</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
          <Input label="Confirm new password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
          {error && <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', fontSize: 12.5, padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
          <Button type="submit" loading={loading} style={{ alignSelf: 'flex-start' }}>Update password</Button>
        </form>
      </Card>
    </div>
  )
}
