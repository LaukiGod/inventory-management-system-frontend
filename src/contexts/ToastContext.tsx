import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx>(null!)
let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: '#f0fdf4', border: '#86efac', icon: '✓' },
    error:   { bg: '#fef2f2', border: '#fca5a5', icon: '✕' },
    warning: { bg: '#fffbeb', border: '#fcd34d', icon: '!' },
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => {
          const c = colors[t.type]
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8,
              padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,.1)', minWidth: 260, maxWidth: 360,
              animation: 'slideUp .2s ease',
            }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: t.type === 'success' ? '#15803d' : t.type === 'error' ? '#dc2626' : '#d97706' }}>
                {c.icon}
              </span>
              <span style={{ fontSize: 13, color: '#1e293b', flex: 1 }}>{t.message}</span>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
