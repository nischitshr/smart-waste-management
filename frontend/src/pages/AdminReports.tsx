import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { AlertTriangle, MapPin, Calendar, User, ImageOff, ChevronRight } from 'lucide-react'
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

type ReportStatus = 'pending' | 'assigned' | 'resolved'

const statusIcon = (status: ReportStatus) => {
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
    reported_by: number | null
    reported_by_username: string | null
    ward: number | null
    ward_name: string | null
    title: string
    description: string
    photo: string | null
    status: ReportStatus
    created_at: string
    resolved_at: string | null
  }
  geometry: {
    coordinates: [number, number] // [lng, lat]
  }
}

const API_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '')

const resolvePhotoUrl = (photo: string | null) => {
  if (!photo) return null
  if (photo.startsWith('http')) return photo
  return `${API_ORIGIN}${photo.startsWith('/') ? '' : '/'}${photo}`
}

const statusColor = (status: ReportStatus) => {
  if (status === 'resolved') return 'bg-primary/10 text-primary'
  if (status === 'assigned') return 'bg-warning/10 text-warning'
  return 'bg-danger/10 text-danger'
}

export default function AdminReports() {
  const { showToast } = useToast()
  const [reports, setReports] = useState<ReportFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | ReportStatus>('all')

  const [selected, setSelected] = useState<ReportFeature | null>(null)
  const [pendingStatus, setPendingStatus] = useState<ReportStatus | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

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

  const openReport = (r: ReportFeature) => {
    setSelected(r)
    setPendingStatus(r.properties.status)
  }

  const closeModal = () => {
    setSelected(null)
    setPendingStatus(null)
    setConfirmOpen(false)
  }

  const requestSave = () => {
    if (!selected || !pendingStatus || pendingStatus === selected.properties.status) return
    setConfirmOpen(true)
  }

  const confirmSave = async () => {
    if (!selected || !pendingStatus) return
    setSaving(true)
    try {
      await api.patch(`/reports/${selected.id}/update-status/`, { status: pendingStatus })
      showToast('Report status updated.', 'success')
      await fetchReports()
      closeModal()
    } catch (err) {
      console.error(err)
      showToast('Failed to update report status.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.properties.status === filter)
  const mapCenter: [number, number] =
    reports.length > 0
      ? [reports[0].geometry.coordinates[1], reports[0].geometry.coordinates[0]]
      : [27.7172, 85.324]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-primary" /> Dumping Reports
      </h2>
      <p className="text-ink/60 mb-6">Review citizen-reported illegal dumping and update status.</p>

      {loading ? (
        <p className="text-sm text-ink/40">Loading reports...</p>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden shadow-sm border border-black/5 mb-6" style={{ height: '360px' }}>
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {reports.map((r) => (
                <Marker
                  key={r.id}
                  position={[r.geometry.coordinates[1], r.geometry.coordinates[0]]}
                  icon={statusIcon(r.properties.status)}
                  eventHandlers={{ click: () => openReport(r) }}
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
            {filtered.map((r) => {
              const photoUrl = resolvePhotoUrl(r.properties.photo)
              return (
                <button
                  key={r.id}
                  onClick={() => openReport(r)}
                  className="w-full text-left bg-surface rounded-2xl shadow-sm border border-black/5 p-4 flex items-center gap-4 hover:border-primary/30 transition"
                >
                  <div className="w-14 h-14 rounded-xl bg-black/5 flex items-center justify-center overflow-hidden shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt={r.properties.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff className="w-5 h-5 text-ink/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-ink/40 shrink-0" /> {r.properties.title}
                    </p>
                    <p className="text-xs text-ink/50 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(r.properties.created_at).toLocaleDateString()}
                      {r.properties.ward_name && <span>· {r.properties.ward_name}</span>}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${statusColor(r.properties.status)}`}>
                    {r.properties.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-ink/30 shrink-0" />
                </button>
              )
            })}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface rounded-2xl shadow-xl border border-black/5 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <p className="text-xs text-ink/40 mb-1 flex items-center gap-1">
                Dumping Reports <ChevronRight className="w-3 h-3" /> {selected.properties.title}
              </p>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-ink pr-4">{selected.properties.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${statusColor(selected.properties.status)}`}>
                  {selected.properties.status}
                </span>
              </div>

              <div className="w-full h-40 rounded-xl bg-black/5 mb-4 flex items-center justify-center overflow-hidden">
                {resolvePhotoUrl(selected.properties.photo) ? (
                  <img
                    src={resolvePhotoUrl(selected.properties.photo)!}
                    alt={selected.properties.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-ink/30 text-sm flex flex-col items-center gap-1">
                    <ImageOff className="w-6 h-6" /> No photo submitted
                  </div>
                )}
              </div>

              <p className="text-sm text-ink/70 mb-4">{selected.properties.description}</p>

              <div className="text-xs text-ink/50 space-y-1 mb-4">
                <p className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Reported by {selected.properties.reported_by_username || 'Unknown'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Submitted {new Date(selected.properties.created_at).toLocaleString()}
                </p>
                {selected.properties.resolved_at && (
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Resolved {new Date(selected.properties.resolved_at).toLocaleString()}
                  </p>
                )}
                {selected.properties.ward_name && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {selected.properties.ward_name}
                  </p>
                )}
              </div>

              <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-black/10">
                <MapContainer
                  center={[selected.geometry.coordinates[1], selected.geometry.coordinates[0]]}
                  zoom={16}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[selected.geometry.coordinates[1], selected.geometry.coordinates[0]]}
                    icon={statusIcon(selected.properties.status)}
                  />
                </MapContainer>
              </div>

              <div className="flex gap-2 items-center mb-4">
                <label className="text-sm text-ink/70 shrink-0">Status</label>
                <select
                  value={pendingStatus || selected.properties.status}
                  onChange={(e) => setPendingStatus(e.target.value as ReportStatus)}
                  className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink/70 hover:bg-black/5 transition"
                >
                  Close
                </button>
                <button
                  onClick={requestSave}
                  disabled={saving || pendingStatus === selected.properties.status}
                  className="flex-1 rounded-xl bg-primary text-white py-2.5 text-sm font-medium hover:bg-primary-light transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Update report status?"
        message={`Change this report's status to "${pendingStatus}"? This will be visible to the reporting citizen.`}
        confirmLabel="Update"
        onConfirm={confirmSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}