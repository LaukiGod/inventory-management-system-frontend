import { useState, useEffect, useCallback } from 'react'
import { api, type StockItem, type Category } from '../api/client'
import { PageHeader, Button, Input, Select, Badge, Spinner, Empty, Confirm } from '../components/ui'
import StockUpdateModal from '../components/StockUpdateModal'
import ItemFormModal from '../components/ItemFormModal'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Items() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<StockItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [updateItem, setUpdateItem] = useState<StockItem | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<StockItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StockItem | null>(null)

  const load = useCallback(async () => {
    try {
      const [itemsData, catData] = await Promise.all([
        api.items.list({ search: search || undefined, category_id: categoryFilter || undefined }),
        api.categories.list(),
      ])
      setItems(itemsData)
      setCategories(catData)
    } catch {
      toast('Failed to load stock items', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter])

  useEffect(() => {
    const t = setTimeout(load, 250) // debounce search
    return () => clearTimeout(t)
  }, [load])

  function handleQtyUpdate(id: string, newQty: number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, current_qty: newQty } : i))
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await api.items.delete(deleteTarget.id)
      toast('Item removed')
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete item', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Stock items"
        subtitle={`${items.length} item${items.length === 1 ? '' : 's'}`}
        action={
          <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Add item
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : items.length === 0 ? (
        <Empty icon="📦" title="No stock items yet" desc="Add your first item to start tracking inventory." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {items.map(item => {
            const isLow = item.current_qty <= item.low_stock_threshold
            return (
              <div key={item.id} style={{
                background: '#fff', border: `1px solid ${isLow ? 'var(--amber-400)' : 'var(--border)'}`,
                borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ height: 120, background: 'var(--slate-100)', position: 'relative' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--slate-300)" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                    </div>
                  )}
                  {isLow && (
                    <div style={{ position: 'absolute', top: 8, left: 8 }}><Badge color="amber">Low stock</Badge></div>
                  )}
                  {isAdmin && (
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                      <IconBtn onClick={() => { setEditItem(item); setFormOpen(true) }} title="Edit">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                      </IconBtn>
                      <IconBtn onClick={() => setDeleteTarget(item)} title="Delete" danger>
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                      </IconBtn>
                    </div>
                  )}
                </div>

                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{item.name}</div>
                    {item.category && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{item.category.name}</div>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 'auto' }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: isLow ? 'var(--amber-600)' : 'var(--text)' }}>{item.current_qty}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>in stock</span>
                  </div>

                  <Button size="sm" onClick={() => setUpdateItem(item)} style={{ width: '100%', marginTop: 2 }}>
                    Update stock
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <StockUpdateModal
        item={updateItem}
        onClose={() => setUpdateItem(null)}
        onUpdated={(newQty) => updateItem && handleQtyUpdate(updateItem.id, newQty)}
      />

      <ItemFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        item={editItem}
        categories={categories}
      />

      <Confirm
        open={!!deleteTarget}
        title="Remove this item?"
        message={`"${deleteTarget?.name}" will be removed from the stock list. Past records are kept.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.92)', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        backdropFilter: 'blur(4px)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={danger ? 'var(--danger)' : 'var(--slate-600)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  )
}
