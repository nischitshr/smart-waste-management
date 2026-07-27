import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { AlertTriangle, MapPin, Calendar } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const statusIcon = (status: string) => {
  const color = status === 'resolved' ? 'green' : status === 'assigned' ? 'orange' : 'red'
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })
}

interface ReportFeature {
  id: number
  properties: {
    reported_by: number
    ward: number
    title: string
    description: string
    photo: string | null
    status: 'pending' | 'assigned' | 'resolved'
    created_at: string
    resolved_at: string | null
  }
  geometry: {
    coordinates: [number, number] // [lng, lat]
  }
}

export default function AdminReports() {
  const { showToast } = useToast()
  const [reports, setReports] = useState<ReportFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned' | 'resolved'>('all')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports/')
      setReports(res.data.results?.features || res.data.features || [])
    } catch (err) {
      console.error(err)
      showToast('Could not load dumping reports.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      await api.patch(`/reports/${id}/update-status/`, { status })
      await fetchReports()
      showToast('Report status updated.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to update report status.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'resolved') return 'bg-primary/10 text-primary'
    if (status === 'assigned') return 'bg-warning/10 text-warning'
    return 'bg-danger/10 text-danger'
  }

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.properties.status === filter)
  const mapCenter: [number, number] =
    reports.length > 0
      ? [reports[0].geometry.coordinates[1], reports[0].geometry.coordinates[0]]
      : [27.7172, 85.3240]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-primary" /> Dumping Reports
      </h2>
      <p className="text-ink/60 mb-6">Review and resolve citizen-reported illegal dumping.</p>

      {loading ? (
        <p className="text-sm text-ink/40">Loading reports...</p>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden shadow-sm border border-black/5 mb-6" style={{ height: '360px' }}>
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              {reports.map((r) => (
                <Marker
                  key={r.id}
                  position={[r.geometry.coordinates[1], r.geometry.coordinates[0]]}
                  icon={statusIcon(r.properties.status)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{r.properties.title}</p>
                      <p className="capitalize">{r.properties.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex gap-2 mb-4">
            {(['all', 'pending', 'assigned', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${
                  filter === f ? 'bg-primary text-white' : 'bg-black/5 text-ink/60 hover:bg-black/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-ink/40">No reports found for this filter.</p>
            )}
            {filtered.map((r) => (
              <div key={r.id} className="bg-surface rounded-2xl shadow-sm border border-black/5 p-4 flex gap-4">
                {r.properties.photo && (
                  <img
                    src={r.properties.photo}
                    alt={r.properties.title}
                    className="w-24 h-24 object-cover rounded-xl border border-black/5 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-ink flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-ink/40" /> {r.properties.title}
                      </p>
                      <p className="text-sm text-ink/70 mt-1">{r.properties.description}</p>
                      <p className="text-xs text-ink/40 flex items-center gap-1 mt-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Reported {new Date(r.properties.created_at).toLocaleDateString()}
                        {r.properties.resolved_at &&
                          ` · Resolved ${new Date(r.properties.resolved_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(r.properties.status)}`}>
                      {r.properties.status}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <select
                      value={r.properties.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      disabled={updatingId === r.id}
                      className="border border-black/10 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}