import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Trash2, Save, Plus, MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import ConfirmDialog from '../components/ConfirmDialog'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const newBinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface Bin {
  id: number
  geometry: { type: string; coordinates: [number, number] }
  properties: {
    address: string
    waste_type: string
    // fill_level: number  // commented out — no hardware sensors yet, future enhancement
    status: string
  }
}

const WASTE_TYPES = ['general', 'organic', 'recyclable']
const STATUSES = ['active', 'inactive', 'maintenance']

function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function AdminBins() {
  const { showToast } = useToast()
  const [bins, setBins] = useState<Bin[]>([])
  const [loading, setLoading] = useState(true)
  const [newPin, setNewPin] = useState<{ lat: number; lng: number } | null>(null)
  const [newForm, setNewForm] = useState({ address: '', waste_type: 'general', status: 'active' })
  const [creating, setCreating] = useState(false)
  const [edits, setEdits] = useState<Record<number, { address: string; waste_type: string; status: string }>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Bin | null>(null)

  const center: [number, number] = [27.7172, 85.3240]

  useEffect(() => {
    fetchBins()
  }, [])

  const fetchBins = async () => {
    try {
      const res = await api.get('/bins/admin/')
      const features: Bin[] = res.data.results?.features || []
      setBins(features)
      const initialEdits: typeof edits = {}
      features.forEach((b) => {
        initialEdits[b.id] = { ...b.properties }
      })
      setEdits(initialEdits)
    } catch (err) {
      console.error(err)
      showToast('Could not load bins.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePlacePin = (lat: number, lng: number) => {
    setNewPin({ lat, lng })
  }

  const handleCreate = async () => {
    if (!newPin || !newForm.address.trim()) return
    setCreating(true)
    try {
      await api.post('/bins/admin/', {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [newPin.lng, newPin.lat] },
        properties: newForm,
      })
      setNewPin(null)
      setNewForm({ address: '', waste_type: 'general', status: 'active' })
      await fetchBins()
      showToast('Bin added successfully.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to add bin.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleReposition = async (id: number, lat: number, lng: number) => {
    try {
      await api.patch(`/bins/admin/${id}/`, {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: edits[id],
      })
      await fetchBins()
      showToast('Bin location updated.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to reposition bin.', 'error')
    }
  }

  const handleSaveEdit = async (id: number) => {
    const bin = bins.find((b) => b.id === id)
    if (!bin) return
    setSavingId(id)
    try {
      await api.patch(`/bins/admin/${id}/`, {
        type: 'Feature',
        geometry: bin.geometry,
        properties: edits[id],
      })
      await fetchBins()
      showToast('Bin updated successfully.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to update bin.', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/bins/admin/${deleteTarget.id}/`)
      await fetchBins()
      showToast('Bin deleted.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to delete bin.', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const updateEdit = (id: number, field: string, value: string | number) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-primary" /> Manage Bins
      </h2>
      <p className="text-ink/60 mb-6">
        Click the map to add a new bin. Drag an existing marker to reposition it.
      </p>

      <div className="rounded-2xl overflow-hidden shadow-sm border border-black/5 mb-6" style={{ height: '420px' }}>
        {!loading && (
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <ClickToPlace onPlace={handlePlacePin} />

            {bins.map((bin) => (
              <Marker
                key={bin.id}
                position={[bin.geometry.coordinates[1], bin.geometry.coordinates[0]]}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target
                    const pos = marker.getLatLng()
                    handleReposition(bin.id, pos.lat, pos.lng)
                  },
                }}
              >
                <Popup>
                  <div className="text-sm space-y-1 min-w-[180px]">
                    <p className="font-semibold">{bin.properties.address}</p>
                    <p className="text-xs text-ink/60">Drag marker to reposition</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {newPin && (
              <Marker position={[newPin.lat, newPin.lng]} icon={newBinIcon}>
                <Popup>New bin location</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      {newPin && (
        <div className="bg-surface rounded-2xl shadow-sm border border-primary/20 p-5 mb-6">
          <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> New Bin
          </h3>
          <input
            type="text"
            value={newForm.address}
            onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
            placeholder="Address"
            className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select
              value={newForm.waste_type}
              onChange={(e) => setNewForm({ ...newForm, waste_type: e.target.value })}
              className="border border-black/10 rounded-xl px-3 py-2 text-sm capitalize"
            >
              {WASTE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={newForm.status}
              onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
              className="border border-black/10 rounded-xl px-3 py-2 text-sm capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {/* fill_level input removed — no hardware sensors yet, future enhancement */}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !newForm.address.trim()}
              className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-light transition disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add Bin'}
            </button>
            <button
              onClick={() => setNewPin(null)}
              className="px-4 rounded-xl border border-black/10 text-sm text-ink/60 hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <h3 className="font-semibold text-ink mb-3">All Bins ({bins.length})</h3>
      {loading && <p className="text-sm text-ink/40">Loading bins...</p>}
      <div className="space-y-3">
        {bins.map((bin) => {
          const edit = edits[bin.id] || bin.properties
          return (
            <div key={bin.id} className="bg-surface rounded-2xl shadow-sm border border-black/5 p-4">
              <input
                type="text"
                value={edit.address}
                onChange={(e) => updateEdit(bin.id, 'address', e.target.value)}
                className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={edit.waste_type}
                  onChange={(e) => updateEdit(bin.id, 'waste_type', e.target.value)}
                  className="border border-black/10 rounded-xl px-2 py-1.5 text-xs capitalize"
                >
                  {WASTE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={edit.status}
                  onChange={(e) => updateEdit(bin.id, 'status', e.target.value)}
                  className="border border-black/10 rounded-xl px-2 py-1.5 text-xs capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {/* fill_level input removed — no hardware sensors yet, future enhancement */}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveEdit(bin.id)}
                  disabled={savingId === bin.id}
                  className="flex-1 bg-primary/10 text-primary rounded-xl py-2 text-xs font-medium hover:bg-primary/20 transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {savingId === bin.id ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setDeleteTarget(bin)}
                  className="px-3 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this bin?"
        message={`This will permanently remove "${deleteTarget?.properties.address}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}