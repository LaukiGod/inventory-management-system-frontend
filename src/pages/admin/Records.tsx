import { useState, useEffect, useCallback } from 'react'
import { api, type StockLog, type StockItem, type User } from '../../api/client'
import { PageHeader, Button, Select, Spinner, Empty, Badge, Card } from '../../components/ui'
import { useToast } from '../../contexts/ToastContext'

type Preset = 'today' | 'week' | 'month' | 'custom'

function fmt(d: Date) { return d.toISOString().split('T')[0] }

function presetRange(preset: Preset): { from: string; to: string } {
  const today = new Date()
  const to = fmt(today)
  if (preset === 'today') return { from: to, to }
  if (preset === 'week') {
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    return { from: fmt(start), to }
  }
  if (preset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: fmt(start), to }
  }
  return { from: to, to }
}

export default function Records() {
  const { toast } = useToast()
  const [preset, setPreset] = useState<Preset>('week')
  const [from, setFrom] = useState(presetRange('week').from)
  const [to, setTo] = useState(presetRange('week').to)
  const [itemFilter, setItemFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [logs, setLogs] = useState<StockLog[]>([])
  const [items, setItems] = useState<StockItem[]>([])
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'csv' | null>(null)

  useEffect(() => {
    api.items.list().then(setItems).catch(() => {})
    api.users.list().then(setStaff).catch(() => {})
  }, [])

  function applyPreset(p: Preset) {
    setPreset(p)
    if (p !== 'custom') {
      const r = presetRange(p)
      setFrom(r.from); setTo(r.to)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.logs.range(from, to, itemFilter || undefined, staffFilter || undefined)
      setLogs(data)
    } catch {
      toast('Failed to load records', 'error')
    } finally {
      setLoading(false)
    }
  }, [from, to, itemFilter, staffFilter])

  useEffect(() => { load() }, [load])

  async function handleExport(format: 'excel' | 'csv') {
    setExporting(format)
    try {
      const blob = format === 'excel' ? await api.export.excel(from, to) : await api.export.csv(from, to)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock-logs-${from}-to-${to}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast('Export downloaded')
    } catch {
      toast('Export failed', 'error')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Records"
        subtitle={`${logs.length} entr${logs.length === 1 ? 'y' : 'ies'} from ${from} to ${to}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => handleExport('csv')} loading={exporting === 'csv'}>Export CSV</Button>
            <Button size="sm" onClick={() => handleExport('excel')} loading={exporting === 'excel'}>Export Excel</Button>
          </div>
        }
      />

      <Card style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {(['today', 'week', 'month', 'custom'] as Preset[]).map(p => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              style={{
                padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 500,
                border: `1px solid ${preset === p ? 'var(--primary)' : 'var(--border)'}`,
                background: preset === p ? 'var(--emerald-50)' : '#fff',
                color: preset === p ? 'var(--primary-h)' : 'var(--text-2)',
              }}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'Last 7 days' : p === 'month' ? 'This month' : 'Custom range'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>From</label>
            <input type="date" value={from} max={to} onChange={e => { setFrom(e.target.value); setPreset('custom') }}
              style={{ height: 34, padding: '0 10px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 12.5 }} />
          </div>
          <div>
            <label style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" value={to} min={from} max={fmt(new Date())} onChange={e => { setTo(e.target.value); setPreset('custom') }}
              style={{ height: 34, padding: '0 10px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 12.5 }} />
          </div>
          <Select value={itemFilter} onChange={e => setItemFilter(e.target.value)} style={{ height: 34, minWidth: 160 }}>
            <option value="">All items</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
          <Select value={staffFilter} onChange={e => setStaffFilter(e.target.value)} style={{ height: 34, minWidth: 160 }}>
            <option value="">All staff</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : logs.length === 0 ? (
        <Empty icon="📋" title="No records found" desc="Try a different date range or filter." />
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', textAlign: 'left' }}>
                  {['Date & time', 'Item', 'Type', 'Qty', 'Note', 'Staff'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{log.stock_item?.name ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge color={log.type === 'RECEIVED' ? 'green' : 'red'}>{log.type === 'RECEIVED' ? 'Received' : 'Used'}</Badge>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{log.quantity}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-3)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.note || '—'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{log.user?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
