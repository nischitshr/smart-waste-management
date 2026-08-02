import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, MapPin, Calendar, Navigation, Package, ClipboardList } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

interface BinDetail {
  id: number
  address: string
  waste_type: string
  latitude: number | null
  longitude: number | null
}

interface Pickup {
  id: number
  address: string
  scheduled_date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
  created_at: string
  bin_detail?: BinDetail | null
}

interface Vehicle {
  id: number
  driver: number | null
  driver_name: string | null
  plate_number: string
  capacity_tons: number
  status: 'available' | 'on_route' | 'maintenance'
}

const STATUS_OPTIONS: Pickup['status'][] = ['pending', 'confirmed', 'completed', 'cancelled']
type Tab = 'today' | 'upcoming' | 'history' | 'vehicle'

const todayStr = () => new Date().toISOString().split('T')[0]
const dateOnly = (d: string) => d.slice(0, 10)

export default function DriverPickups() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const [pickups, setPickups] = useState<Pickup[]>([])
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<number, { status: string; notes: string }>>({})
  const [tab, setTab] = useState<Tab>('today')

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    fetchPickups()
    fetchVehicle()
  }, [])

  useEffect(() => {
    if (!highlightId || pickups.length === 0) return
    const id = Number(highlightId)
    const target = pickups.find((p) => p.id === id)
    if (target) {
      const isPast = dateOnly(target.scheduled_date) < todayStr()
      if (target.status === 'completed' || target.status === 'cancelled' || isPast) {
        setTab('history')
      } else if (dateOnly(target.scheduled_date) === todayStr()) {
        setTab('today')
      } else {
        setTab('upcoming')
      }
    }
    const scrollTimeout = setTimeout(() => {
      const el = cardRefs.current[id]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    const clearHighlightTimeout = setTimeout(() => {
      setSearchParams({}, { replace: true })
    }, 2500)
    return () => {
      clearTimeout(scrollTimeout)
      clearTimeout(clearHighlightTimeout)
    }
  }, [highlightId, pickups, setSearchParams])

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

  const fetchVehicle = async () => {
    try {
      const res = await api.get('/routes/vehicles/')
      const all: Vehicle[] = res.data.results || []
      const mine = all.find((v) => v.driver === user?.id) || null
      setVehicle(mine)
    } catch (err) {
      console.error(err)
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

  const directionsUrl = (p: Pickup) => {
    const lat = p.bin_detail?.latitude
    const lng = p.bin_detail?.longitude
    if (lat != null && lng != null) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`
  }

  const isHistoryStatus = (p: Pickup) =>
    p.status === 'completed' || p.status === 'cancelled' || dateOnly(p.scheduled_date) < todayStr()

  const todayPickups = pickups.filter((p) => dateOnly(p.scheduled_date) === todayStr() && !isHistoryStatus(p))
  const upcomingPickups = pickups
    .filter((p) => dateOnly(p.scheduled_date) > todayStr() && !isHistoryStatus(p))
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
  const historyPickups = pickups
    .filter(isHistoryStatus)
    .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))

  const renderPickupCard = (p: Pickup) => {
    const draft = drafts[p.id] || { status: p.status, notes: p.notes }
    const isHighlighted = highlightId !== null && Number(highlightId) === p.id
    return (
      <div
        key={p.id}
        ref={(el) => {
          cardRefs.current[p.id] = el
        }}
        className={`bg-surface rounded-2xl shadow-sm border p-5 transition-all duration-500 ${
          isHighlighted ? 'border-primary ring-2 ring-primary/40 bg-primary/5' : 'border-black/5'
        }`}
      >
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

        <a
          href={directionsUrl(p)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-4"
        >
          <Navigation className="w-3.5 h-3.5" /> Get Directions
        </a>

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
  }

  const renderHistoryRow = (p: Pickup) => {
    const isHighlighted = highlightId !== null && Number(highlightId) === p.id
    return (
      <div
        key={p.id}
        ref={(el) => {
          cardRefs.current[p.id] = el
        }}
        className={`bg-surface rounded-xl border px-4 py-3 flex items-center justify-between transition-all duration-500 ${
          isHighlighted ? 'border-primary ring-2 ring-primary/40 bg-primary/5' : 'border-black/5'
        }`}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{p.address}</p>
          <p className="text-xs text-ink/40">
            {new Date(p.scheduled_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ml-3 ${statusColor(p.status)}`}>
          {p.status}
        </span>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'today', label: 'Today', count: todayPickups.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingPickups.length },
    { key: 'history', label: 'History', count: historyPickups.length },
    { key: 'vehicle', label: 'My Vehicle' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-primary" /> My Pickups
      </h2>
      <p className="text-ink/60 mb-6">Manage your assigned pickups and vehicle.</p>

      <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-xs text-ink/40">({t.count})</span>}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ink/40">Loading...</p>}

      {!loading && tab === 'today' && (
        <div className="space-y-4">
          {todayPickups.length === 0 && <p className="text-sm text-ink/40">No pickups scheduled for today.</p>}
          {todayPickups.map(renderPickupCard)}
        </div>
      )}

      {!loading && tab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingPickups.length === 0 && <p className="text-sm text-ink/40">No upcoming pickups.</p>}
          {upcomingPickups.map(renderPickupCard)}
        </div>
      )}

      {!loading && tab === 'history' && (
        <div className="space-y-2">
          {historyPickups.length === 0 && <p className="text-sm text-ink/40">No pickup history yet.</p>}
          {historyPickups.map(renderHistoryRow)}
        </div>
      )}

      {!loading && tab === 'vehicle' && (
        <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-6">
          {vehicle ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">{vehicle.plate_number}</p>
                <p className="text-sm text-ink/60">{vehicle.capacity_tons}t capacity</p>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(vehicle.status)}`}>
                  {vehicle.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink/40">No vehicle currently assigned to you.</p>
          )}
        </div>
      )}
    </div>
  )
}