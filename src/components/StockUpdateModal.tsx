import { useState } from 'react'
import { api, type StockItem } from '../api/client'
import { Modal, Button } from './ui'
import { useToast } from '../contexts/ToastContext'

interface Props {
  item: StockItem | null
  onClose: () => void
  onUpdated: (newQty: number) => void
}

export default function StockUpdateModal({ item, onClose, onUpdated }: Props) {
  const { toast } = useToast()
  const [type, setType] = useState<'RECEIVED' | 'CONSUMED'>('RECEIVED')
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!item) return null
  const currentItem = item

  const qtyNum = parseInt(qty, 10)
  const wouldGoNegative = type === 'CONSUMED' && qtyNum > 0 && currentItem.current_qty - qtyNum <= 0
  const resultPreview = qtyNum > 0
    ? type === 'RECEIVED' ? currentItem.current_qty + qtyNum : currentItem.current_qty - qtyNum
    : null

  async function handleSubmit() {
    setError('')
    if (!qty || qtyNum <= 0) { setError('Enter a quantity greater than 0'); return }
    if (wouldGoNegative) { setError('Not enough stock — this would go below zero'); return }

    setLoading(true)
    try {
      const res = await api.logs.add(currentItem.id, { type, quantity: qtyNum, note: note.trim() || undefined })
      toast(type === 'RECEIVED' ? `Added ${qtyNum} to ${currentItem.name}` : `Removed ${qtyNum} from ${currentItem.name}`)
      onUpdated(res.new_qty)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setQty(''); setNote(''); setType('RECEIVED'); setError('')
    onClose()
  }

  return (
    <Modal open={!!item} onClose={handleClose} title={item.name} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Current qty strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--slate-50)', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Current quantity</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{item.current_qty}</span>
        </div>

        {/* Big tactile toggle — the signature element */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => setType('RECEIVED')}
            style={{
              padding: '20px 12px', borderRadius: 14, border: `2px solid ${type === 'RECEIVED' ? 'var(--emerald-500)' : 'var(--border)'}`,
              background: type === 'RECEIVED' ? 'var(--emerald-50)' : '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              transition: 'border-color .15s, background .15s', cursor: 'pointer',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={type === 'RECEIVED' ? 'var(--emerald-600)' : 'var(--slate-400)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: type === 'RECEIVED' ? 'var(--emerald-700)' : 'var(--slate-500)' }}>Received</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Stock came in</span>
          </button>

          <button
            onClick={() => setType('CONSUMED')}
            style={{
              padding: '20px 12px', borderRadius: 14, border: `2px solid ${type === 'CONSUMED' ? 'var(--red-500)' : 'var(--border)'}`,
              background: type === 'CONSUMED' ? 'var(--red-50)' : '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              transition: 'border-color .15s, background .15s', cursor: 'pointer',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={type === 'CONSUMED' ? 'var(--red-600)' : 'var(--slate-400)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: type === 'CONSUMED' ? 'var(--red-700)' : 'var(--slate-500)' }}>Used</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Stock went out</span>
          </button>
        </div>

        {/* Quantity input — large for easy tapping */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Quantity</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="0"
            autoFocus
            style={{
              width: '100%', height: 56, fontSize: 26, fontWeight: 700, textAlign: 'center',
              border: `1px solid ${wouldGoNegative ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 12,
              color: 'var(--text)', outline: 'none',
            }}
          />
          {resultPreview !== null && (
            <p style={{ textAlign: 'center', fontSize: 12, color: wouldGoNegative ? 'var(--danger)' : 'var(--text-3)', marginTop: 6 }}>
              {wouldGoNegative
                ? `Only ${item.current_qty} in stock — can't remove ${qtyNum}`
                : `New quantity will be ${resultPreview}`}
            </p>
          )}
        </div>

        {/* Optional note */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Delivery from supplier, damaged box, etc."
            rows={2}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {error && (
          <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', fontSize: 12.5, padding: '8px 12px', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!qty || wouldGoNegative}
          style={{ width: '100%', height: 46, fontSize: 14 }}
          variant={type === 'CONSUMED' ? 'danger' : 'primary'}
        >
          {type === 'RECEIVED' ? `Add ${qty || 0} to stock` : `Remove ${qty || 0} from stock`}
        </Button>
      </div>
    </Modal>
  )
}
