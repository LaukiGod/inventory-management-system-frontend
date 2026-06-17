import { useState, useEffect } from 'react'
import { api, type User } from '../../api/client'
import { PageHeader, Button, Input, Select, Modal, Badge, Spinner, Empty, Confirm } from '../../components/ui'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

export default function Staff() {
  const { toast } = useToast()
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)

  function load() {
    api.users.list().then(setUsers).catch(() => toast('Failed to load staff', 'error')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleToggle() {
    if (!toggleTarget) return
    try {
      await api.users.setActive(toggleTarget.id, !toggleTarget.is_active)
      toast(toggleTarget.is_active ? 'Account deactivated' : 'Account activated')
      load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update account', 'error')
    } finally {
      setToggleTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle={`${users.length} account${users.length === 1 ? '' : 's'}`}
        action={<Button onClick={() => setCreateOpen(true)}>+ Add staff</Button>}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : users.length === 0 ? (
        <Empty icon="👥" title="No staff accounts yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--slate-600)', flexShrink: 0 }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {u.name}
                  {u.id === me?.id && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>(you)</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{u.email}</div>
              </div>
              <Badge color={u.role === 'ADMIN' ? 'purple' : 'gray'}>{u.role}</Badge>
              <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="secondary" onClick={() => setResetTarget(u)}>Reset password</Button>
                {u.id !== me?.id && (
                  <Button size="sm" variant={u.is_active ? 'danger' : 'primary'} onClick={() => setToggleTarget(u)}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateStaffModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
      <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />

      <Confirm
        open={!!toggleTarget}
        title={toggleTarget?.is_active ? 'Deactivate account?' : 'Activate account?'}
        message={toggleTarget?.is_active
          ? `${toggleTarget?.name} will no longer be able to log in.`
          : `${toggleTarget?.name} will be able to log in again.`}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
        danger={toggleTarget?.is_active}
      />
    </div>
  )
}

function CreateStaffModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STAFF')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() { setName(''); setEmail(''); setPassword(''); setRole('STAFF'); setError('') }

  async function handleSubmit() {
    setError('')
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Fill all fields. Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await api.users.create({ name: name.trim(), email: email.trim(), password, role })
      toast('Staff account created')
      onCreated()
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Add staff account" width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" autoFocus />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ravi@company.com" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
        <Select label="Role" value={role} onChange={e => setRole(e.target.value)}>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </Select>
        {error && <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', fontSize: 12.5, padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => { reset(); onClose() }}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Create account</Button>
        </div>
      </div>
    </Modal>
  )
}

function ResetPasswordModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!user) return
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      await api.users.resetPassword(user.id, password)
      toast(`Password reset for ${user.name}`)
      setPassword('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={!!user} onClose={onClose} title={`Reset password — ${user?.name}`} width={380}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" autoFocus />
        {error && <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', fontSize: 12.5, padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Reset password</Button>
        </div>
      </div>
    </Modal>
  )
}
