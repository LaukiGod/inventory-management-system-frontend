import { useState, useEffect } from 'react'
import { api, type Category } from '../../api/client'
import { PageHeader, Button, Input, Spinner, Empty, Confirm, Card } from '../../components/ui'
import { useToast } from '../../contexts/ToastContext'

export default function Categories() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  function load() {
    api.categories.list().then(setCategories).catch(() => toast('Failed to load categories', 'error')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await api.categories.create(newName.trim())
      setNewName('')
      toast('Category added')
      load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add category', 'error')
    } finally {
      setCreating(false)
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    try {
      await api.categories.update(id, editName.trim())
      toast('Category renamed')
      setEditingId(null)
      load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to rename category', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await api.categories.delete(deleteTarget.id)
      toast('Category deleted')
      load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete category', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader title="Categories" subtitle={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`} />

      <Card style={{ padding: 16, marginBottom: 18, display: 'flex', gap: 8 }}>
        <Input
          placeholder="New category name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          style={{ flex: 1 }}
        />
        <Button onClick={handleCreate} loading={creating} disabled={!newName.trim()}>Add</Button>
      </Card>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : categories.length === 0 ? (
        <Empty icon="🏷️" title="No categories yet" desc="Add one above to start organising your stock items." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map(c => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              {editingId === c.id ? (
                <>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename(c.id)} autoFocus style={{ flex: 1 }} />
                  <Button size="sm" onClick={() => handleRename(c.id)}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{c.name}</span>
                  <Button size="sm" variant="secondary" onClick={() => { setEditingId(c.id); setEditName(c.name) }}>Rename</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(c)}>Delete</Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Confirm
        open={!!deleteTarget}
        title="Delete category?"
        message={`"${deleteTarget?.name}" will be removed. This is blocked if any items still use it.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
