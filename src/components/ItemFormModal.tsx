import { useState, useEffect, useRef } from 'react'
import { api, type StockItem, type Category } from '../api/client'
import { Modal, Button, Input, Select } from './ui'
import { useToast } from '../contexts/ToastContext'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  item?: StockItem | null
  categories: Category[]
}

export default function ItemFormModal({ open, onClose, onSaved, item, categories }: Props) {
  const { toast } = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [startQty, setStartQty] = useState('0')
  const [threshold, setThreshold] = useState('10')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!item

  useEffect(() => {
    if (open) {
      setName(item?.name ?? '')
      setCategoryId(item?.category?.id ?? '')
      setStartQty(String(item?.current_qty ?? 0))
      setThreshold(String(item?.low_stock_threshold ?? 10))
      setImagePreview(item?.image_url ?? null)
      setImageFile(null)
      setError('')
    }
  }, [open, item])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    setError('')
    if (!name.trim()) { setError('Item name is required'); return }

    setLoading(true)
    try {
      const form = new FormData()
      form.append('name', name.trim())
      if (categoryId) form.append('category_id', categoryId)
      form.append('low_stock_threshold', threshold || '10')
      if (!isEdit) form.append('current_qty', startQty || '0')
      if (imageFile) form.append('image', imageFile)

      if (isEdit) {
        await api.items.update(item!.id, form)
        toast('Item updated')
      } else {
        await api.items.create(form)
        toast('Item created')
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit item' : 'Add new item'} width={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Image picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            onClick={() => fileInput.current?.click()}
            style={{
              width: 72, height: 72, borderRadius: 12, background: 'var(--slate-100)',
              border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
            )}
          </div>
          <div>
            <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()} type="button">
              {imagePreview ? 'Change photo' : 'Add photo'}
            </Button>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>JPG, PNG or WebP, up to 5MB</p>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        <Input label="Item name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rice Bag 10kg" autoFocus />

        <Select label="Category" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">No category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr' : '1fr 1fr', gap: 12 }}>
          {!isEdit && (
            <Input label="Starting quantity" type="number" min={0} value={startQty} onChange={e => setStartQty(e.target.value)} />
          )}
          <Input label="Low stock alert at" type="number" min={0} value={threshold} onChange={e => setThreshold(e.target.value)} />
        </div>

        {error && (
          <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', fontSize: 12.5, padding: '8px 12px', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} type="button">
            {isEdit ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
