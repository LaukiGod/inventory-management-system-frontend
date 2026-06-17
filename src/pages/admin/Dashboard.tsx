import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { api, type ChartPoint, type StockItem } from '../../api/client'
import { PageHeader, Spinner, Empty, Card, Badge } from '../../components/ui'
import { useToast } from '../../contexts/ToastContext'
import { Link } from 'react-router-dom'

interface Summary { total_items: number; low_stock_count: number; today_updates: number }

export default function Dashboard() {
  const { toast } = useToast()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [chart, setChart] = useState<ChartPoint[]>([])
  const [lowStock, setLowStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.dashboard.summary(), api.dashboard.chart(7), api.dashboard.lowStock()])
      .then(([s, c, l]) => { setSummary(s); setChart(c); setLowStock(l) })
      .catch(() => toast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your inventory" />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatCard label="Total items" value={summary?.total_items ?? 0} icon="📦" />
        <StatCard label="Low stock" value={summary?.low_stock_count ?? 0} icon="⚠️" tone={summary && summary.low_stock_count > 0 ? 'amber' : undefined} />
        <StatCard label="Updates today" value={summary?.today_updates ?? 0} icon="🕒" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, alignItems: 'start' }} className="dash-grid">
        {/* Chart */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 14 }}>Stock activity — last 7 days</div>
          {chart.every(c => c.received === 0 && c.consumed === 0) ? (
            <Empty icon="📊" title="No activity yet" desc="Updates will appear here once staff start logging stock." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { weekday: 'short' })}
                  tick={{ fontSize: 12, fill: 'var(--slate-500)' }}
                  axisLine={{ stroke: 'var(--slate-200)' }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: 'var(--slate-500)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}
                  labelFormatter={d => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="received" name="Received" fill="var(--emerald-500)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumed" name="Used" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Low stock list */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 14 }}>Low stock items</div>
          {lowStock.length === 0 ? (
            <Empty icon="✅" title="All stocked up" desc="No items are below their threshold." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lowStock.slice(0, 6).map(item => (
                <Link key={item.id} to="/items" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--amber-50)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: '#fff', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 14 }}>📦</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--amber-600)' }}>{item.current_qty} left · alert at {item.low_stock_threshold}</div>
                  </div>
                </Link>
              ))}
              {lowStock.length > 6 && (
                <Link to="/items" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, textAlign: 'center', padding: '6px 0' }}>
                  View {lowStock.length - 6} more →
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>

      <style>{`@media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: string; tone?: 'amber' }) {
  return (
    <Card style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: tone === 'amber' ? 'var(--amber-50)' : 'var(--slate-50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: tone === 'amber' ? 'var(--amber-600)' : 'var(--text)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{label}</div>
      </div>
    </Card>
  )
}
