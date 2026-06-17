import { useState, useEffect } from 'react'
import { api, type StockLog } from '../api/client'
import { PageHeader, Spinner, Empty, Badge } from '../components/ui'
import { useToast } from '../contexts/ToastContext'

export default function Today() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<StockLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.logs.today()
      .then(setLogs)
      .catch(() => toast('Failed to load today\'s activity', 'error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Today's activity" subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : logs.length === 0 ? (
        <Empty icon="🕒" title="No updates yet today" desc="Stock updates you and others make today will show up here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map(log => (
            <div key={log.id} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: log.type === 'RECEIVED' ? 'var(--emerald-50)' : 'var(--red-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={log.type === 'RECEIVED' ? 'var(--emerald-600)' : 'var(--red-600)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {log.type === 'RECEIVED' ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{log.stock_item?.name ?? 'Unknown item'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>
                  {log.user?.name ?? 'Unknown'} · {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {log.note && <span> · {log.note}</span>}
                </div>
              </div>

              <Badge color={log.type === 'RECEIVED' ? 'green' : 'red'}>
                {log.type === 'RECEIVED' ? '+' : '−'}{log.quantity}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
