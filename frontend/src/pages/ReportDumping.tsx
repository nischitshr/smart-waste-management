import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { Camera, Send, CheckCircle2 } from 'lucide-react'
import api from '../api/axios'

const markerIcon = new L.Icon.Default()

interface Report {
  id: number
  properties: {
    title: string
    description: string
    status: string
    created_at: string
    photo: string | null
  }
}

export default function ReportDumping() {
  const [location, setLocation] = useState<[number, number]>([27.7172, 85.3240])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {} // keep fallback default
    )
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports/')
      setReports(res.data.results?.features || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    if (!description.trim() || !title.trim()) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append(
        'location',
        JSON.stringify({ type: 'Point', coordinates: [location[1], location[0]] })
      )
      if (photo) formData.append('photo', photo)

      await api.post('/reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSuccess(true)
      setTitle('')
      setDescription('')
      setPhoto(null)
      fetchReports()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'resolved') return 'bg-primary/10 text-primary'
    if (status === 'assigned') return 'bg-warning/10 text-warning'
    return 'bg-danger/10 text-danger'
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1">Report Illegal Dumping</h2>
      <p className="text-ink/60 mb-6">Help keep Ward 15 clean — report a dumping site near you.</p>

      <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
        <label className="block text-sm font-medium text-ink mb-2">Location</label>
        <div className="rounded-xl overflow-hidden mb-4" style={{ height: '220px' }}>
          <MapContainer center={location} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            <Marker
              position={location}
              draggable
              icon={markerIcon}
              eventHandlers={{
                dragend: (e) => {
                  const pos = e.target.getLatLng()
                  setLocation([pos.lat, pos.lng])
                },
              }}
            />
          </MapContainer>
        </div>
        <p className="text-xs text-ink/40 mb-6">Drag the pin to adjust the exact location</p>

        <label className="block text-sm font-medium text-ink mb-2">Subject</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Overflowing bin near market entrance"
          className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <label className="block text-sm font-medium text-ink mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the dumping site — type of waste, size, landmark..."
          className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          rows={4}
        />

        <label className="block text-sm font-medium text-ink mb-2">Photo (optional)</label>
        <label className="flex items-center gap-2 border border-dashed border-black/15 rounded-xl px-4 py-3 text-sm text-ink/50 cursor-pointer hover:border-primary/30 transition mb-6">
          <Camera className="w-4 h-4" />
          {photo ? photo.name : 'Add a photo'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={submitting || !description.trim() || !title.trim()}
          className="w-full bg-primary text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium hover:bg-primary-light transition disabled:opacity-50"
        >
          {success ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Report submitted
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Report'}
            </>
          )}
        </button>
      </div>

      <h3 className="font-semibold text-ink mb-3">My Reports</h3>
      <div className="space-y-3">
        {reports.length === 0 && (
          <p className="text-sm text-ink/40">No reports submitted yet.</p>
        )}
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-surface rounded-xl p-4 border border-black/5 flex justify-between items-start"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{r.properties.title}</p>
              <p className="text-sm text-ink/70">{r.properties.description}</p>
              <p className="text-xs text-ink/40 mt-1">
                {new Date(r.properties.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(r.properties.status)}`}>
              {r.properties.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}