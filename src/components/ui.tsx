import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, useEffect, useRef } from 'react'

// ── Button ────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, children, disabled, style, ...rest }: BtnProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' },
    secondary: { background: '#fff', color: 'var(--slate-700)', border: '1px solid var(--border)' },
    danger:    { background: 'var(--danger)', color: '#fff', border: '1px solid var(--danger)' },
    ghost:     { background: 'transparent', color: 'var(--text-2)', border: '1px solid transparent' },
  }
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '5px 12px', fontSize: 12, height: 30, borderRadius: 6 },
    md: { padding: '8px 16px', fontSize: 13, height: 36, borderRadius: 8 },
  }
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1, transition: 'opacity .15s, background .15s',
        whiteSpace: 'nowrap',
        ...styles[variant], ...sizes[size], ...style,
      }}
      {...rest}
    >
      {loading ? <Spinner size={14} color="currentColor" /> : null}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</span>}
      <input
        style={{
          height: 36, padding: '0 12px', borderRadius: 8, fontSize: 13,
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          background: '#fff', color: 'var(--text)', outline: 'none',
          transition: 'border-color .15s',
          ...style,
        }}
        {...rest}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{error}</span>}
    </label>
  )
}

// ── Select ────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

export function Select({ label, children, style, ...rest }: SelectProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</span>}
      <select
        style={{
          height: 36, padding: '0 12px', borderRadius: 8, fontSize: 13,
          border: '1px solid var(--border)', background: '#fff', color: 'var(--text)',
          outline: 'none', cursor: 'pointer', ...style,
        }}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

// ── Modal ─────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        animation: 'fadeIn .15s ease',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp .2s ease',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-3)', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin .7s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity=".2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </svg>
  )
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: 'gray' | 'green' | 'amber' | 'red' | 'purple' }) {
  const colors = {
    gray:   { bg: 'var(--slate-100)', text: 'var(--slate-600)' },
    green:  { bg: 'var(--emerald-50)', text: 'var(--emerald-700)' },
    amber:  { bg: 'var(--amber-50)', text: 'var(--amber-600)' },
    red:    { bg: 'var(--red-50)', text: 'var(--red-700)' },
    purple: { bg: '#ede9fe', text: '#6d28d9' },
  }
  const c = colors[color]
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

// ── Empty state ───────────────────────────────────────────
export function Empty({ icon = '📭', title, desc }: { icon?: string; title: string; desc?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', color: 'var(--text-3)', textAlign: 'center', gap: 8 }}>
      <span style={{ fontSize: 36 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>{title}</span>
      {desc && <span style={{ fontSize: 13 }}>{desc}</span>}
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────
export function Confirm({ open, title, message, onConfirm, onCancel, danger = true }:
  { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width={380}>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  )
}

// ── Page header ───────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', ...style }}>
      {children}
    </div>
  )
}
