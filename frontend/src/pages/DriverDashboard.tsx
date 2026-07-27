import { useState, useEffect } from 'react'
import { Truck, CheckCircle2, MapPin, Calendar } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

interface Pickup {
  id: number
  address: string
  scheduled_date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
  created_at: string
}

const STATUS_OPTIONS: Pickup['status'][] = ['pending', 'confirmed', 'completed', 'cancelled']

export default function DriverDashboard() {
  const { showToast } = useToast()
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<number, { status: string; notes: string }>>({})

  useEffect(() => {
    fetchPickups()
  }, [])

  const fetchPickups = async () => {
    try {
      const res = await api.get('/pickups/')
      const results: Pickup[] = res.data.results || []
      setPickups(results)
      const initialDrafts: Record<number, { status: string; notes: string }> = {}
      results.forEach((p) => {
        initialDrafts[p.id] = { status: p.status, notes: p.notes }
      })
      setDrafts(initialDrafts)
    } catch (err) {
      console.error(err)
      showToast('Could not load your assigned pickups.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateDraft = (id: number, field: 'status' | 'notes', value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleSave = async (id: number) => {
    const draft = drafts[id]
    if (!draft) return
    setSavingId(id)
    try {
      await api.patch(`/pickups/${id}/update-status/`, {
        status: draft.status,
        notes: draft.notes,
      })
      setPickups((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: draft.status as Pickup['status'], notes: draft.notes } : p))
      )
      setSavedId(id)
      showToast('Pickup status updated.', 'success')
      setTimeout(() => setSavedId(null), 2000)
    } catch (err) {
      console.error(err)
      showToast('Failed to update pickup status.', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'completed') return 'bg-primary/10 text-primary'
    if (status === 'confirmed') return 'bg-primary/10 text-primary'
    if (status === 'cancelled') return 'bg-danger/10 text-danger'
    return 'bg-warning/10 text-warning'
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <Truck className="w-6 h-6 text-primary" /> My Assigned Pickups
      </h2>
      <p className="text-ink/60 mb-6">Update the status of pickups assigned to you.</p>

      {loading && <p className="text-sm text-ink/40">Loading your assignments...</p>}
      {!loading && pickups.length === 0 && (
        <p className="text-sm text-ink/40">No pickups assigned to you yet.</p>
      )}

      <div className="space-y-4">
        {pickups.map((p) => {
          const draft = drafts[p.id] || { status: p.status, notes: p.notes }
          return (
            <div key={p.id} className="bg-surface rounded-2xl shadow-sm border border-black/5 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-semibold text-ink flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-ink/40" /> {p.address}
                  </p>
                  <p className="text-sm text-ink/70 flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-ink/40" />
                    {new Date(p.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <label className="block text-xs font-medium text-ink/60 mb-1">Update status</label>
              <select
                value={draft.status}
                onChange={(e) => updateDraft(p.id, 'status', e.target.value)}
                className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30 capitalize"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>

              <label className="block text-xs font-medium text-ink/60 mb-1">Notes</label>
              <textarea
                value={draft.notes}
                onChange={(e) => updateDraft(p.id, 'notes', e.target.value)}
                placeholder="Add a note for this pickup..."
                className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={2}
              />

              <button
                onClick={() => handleSave(p.id)}
                disabled={savingId === p.id}
                className="w-full bg-primary text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary-light transition disabled:opacity-50"
              >
                {savedId === p.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </>
                ) : savingId === p.id ? (
                  'Saving...'
                ) : (
                  'Save Update'
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}