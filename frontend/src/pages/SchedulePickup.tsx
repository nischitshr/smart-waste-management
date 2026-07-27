import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { CalendarPlus, CheckCircle2 } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface Bin {
  id: number
  properties: {
    address: string
    fill_level: number
    waste_type: string
    status: string
    is_high_priority: boolean
  }
  geometry: {
    coordinates: [number, number] // [lng, lat]
  }
}

interface Pickup {
  id: number
  address: string
  bin_detail?: { id: number; address: string; waste_type: string; latitude: number; longitude: number } | null
  scheduled_date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
  created_at: string
}

export default function SchedulePickup() {
  const { showToast } = useToast()
  const [bins, setBins] = useState<Bin[]>([])
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number]>([27.7172, 85.3240])
  const [mapLoading, setMapLoading] = useState(true)
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        fetchBins(coords[0], coords[1])
      },
      () => {
        fetchBins(27.7172, 85.3240)
      }
    )
    fetchPickups()
  }, [])

  const fetchBins = async (lat: number, lng: number) => {
    try {
      const res = await api.get(`/bins/?lat=${lat}&lng=${lng}`)
      setBins(res.data.results?.features || [])
    } catch (err) {
      console.error(err)
      showToast('Could not load nearby bins.', 'error')
    } finally {
      setMapLoading(false)
    }
  }

  const fetchPickups = async () => {
    try {
      const res = await api.get('/pickups/')
      setPickups(res.data.results || [])
    } catch (err) {
      console.error(err)
      showToast('Could not load your pickup requests.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedBin || !scheduledDate) return
    setSubmitting(true)
    try {
      await api.post('/pickups/', {
        bin: selectedBin.id,
        scheduled_date: scheduledDate,
        notes,
      })

      setSuccess(true)
      setSelectedBin(null)
      setScheduledDate('')
      setNotes('')
      fetchPickups()
      showToast('Pickup requested successfully.', 'success')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      showToast('Failed to request pickup.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'completed') return 'bg-primary/10 text-primary'
    if (status === 'confirmed') return 'bg-primary/10 text-primary'
    if (status === 'cancelled') return 'bg-danger/10 text-danger'
    return 'bg-warning/10 text-warning'
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1">Schedule a Pickup</h2>
      <p className="text-ink/60 mb-6">Pick a bin stop near you on the map and request a collection.</p>

      <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
        <label className="block text-sm font-medium text-ink mb-2">Select a pickup stop</label>

        {mapLoading ? (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl mb-4">
            <p className="text-ink/40 text-sm">Finding bins near you...</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden mb-4" style={{ height: '320px' }}>
            <MapContainer center={userLocation} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              <Circle center={userLocation} radius={500} color="green" fillOpacity={0.1} />
              {bins.map((bin) => (
                <Marker
                  key={bin.id}
                  position={[bin.geometry.coordinates[1], bin.geometry.coordinates[0]]}
                  icon={selectedBin?.id === bin.id ? selectedIcon : new L.Icon.Default()}
                  eventHandlers={{ click: () => setSelectedBin(bin) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{bin.properties.address}</p>
                      <p>Type: {bin.properties.waste_type}</p>
                      <button
                        onClick={() => setSelectedBin(bin)}
                        className="mt-1 text-primary text-xs font-medium underline"
                      >
                        Select this stop
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {bins.length === 0 && !mapLoading && (
          <p className="text-sm text-ink/40 mb-4">No bin stops found nearby. Try a different location or check back later.</p>
        )}

        <div className="space-y-2 mb-4">
          {bins.map((bin) => (
            <button
              key={bin.id}
              onClick={() => setSelectedBin(bin)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition ${
                selectedBin?.id === bin.id
                  ? 'border-primary bg-primary/5 text-ink'
                  : 'border-black/10 text-ink/70 hover:border-primary/40'
              }`}
            >
              <span className="font-medium">{bin.properties.address}</span>
              <span className="text-ink/40"> · {bin.properties.waste_type}</span>
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-ink mb-2">Preferred date</label>
        <input
          type="date"
          value={scheduledDate}
          min={today}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <label className="block text-sm font-medium text-ink mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything the driver should know — volume, access, gate code..."
          className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedBin || !scheduledDate}
          className="w-full bg-primary text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium hover:bg-primary-light transition disabled:opacity-50"
        >
          {success ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Pickup requested
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Request Pickup'}
            </>
          )}
        </button>
      </div>

      <h3 className="font-semibold text-ink mb-3">My Pickup Requests</h3>
      <div className="space-y-3">
        {loading && <p className="text-sm text-ink/40">Loading your requests...</p>}
        {!loading && pickups.length === 0 && (
          <p className="text-sm text-ink/40">No pickups requested yet.</p>
        )}
        {pickups.map((p) => (
          <div
            key={p.id}
            className="bg-surface rounded-xl p-4 border border-black/5 flex justify-between items-start"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{p.bin_detail?.address || p.address}</p>
              <p className="text-sm text-ink/70">
                Scheduled: {new Date(p.scheduled_date).toLocaleDateString()}
              </p>
              {p.notes && <p className="text-xs text-ink/50 mt-1">{p.notes}</p>}
              <p className="text-xs text-ink/40 mt-1">
                Requested {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(p.status)}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}