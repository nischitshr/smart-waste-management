import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { StyledTileLayer, MapStyleSwitch } from '../components/MapStyleToggle'
import type { MapStyle } from '../components/MapStyleToggle'

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Fallback center — Kathmandu Ward 15 area — used only if no bins are returned
const FALLBACK_CENTER: [number, number] = [27.7172, 85.3240]

interface Bin {
  id: number
  properties: {
    ward: number | null
    address: string
    waste_type: string
    status: string
    last_collected: string | null
  }
  geometry: {
    coordinates: [number, number]
  }
}

export default function DriverBins() {
  const { showToast } = useToast()
  const [bins, setBins] = useState<Bin[]>([])
  const [loading, setLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard')

  useEffect(() => {
    fetchBins()
  }, [])

  const fetchBins = async () => {
    try {
      const res = await api.get('/bins/driver/')
      setBins(res.data.results?.features || [])
    } catch (err) {
      console.error('fetchBins (driver) error', err)
      showToast('Could not load bin locations for your ward.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const mapCenter: [number, number] =
    bins.length > 0
      ? [
          bins.reduce((sum, b) => sum + b.geometry.coordinates[1], 0) / bins.length,
          bins.reduce((sum, b) => sum + b.geometry.coordinates[0], 0) / bins.length,
        ]
      : FALLBACK_CENTER

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-primary" /> Ward Bin Locations
      </h2>
      <p className="text-ink/60 mb-6">Fixed bin locations for your weekly collection route.</p>

      {loading ? (
        <p className="text-sm text-ink/40">Loading bin locations...</p>
      ) : (
        <>
          <div className="relative rounded-2xl overflow-hidden shadow-sm border border-black/5 mb-6" style={{ height: '400px' }}>
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
              <StyledTileLayer style={mapStyle} />
              {bins.map((bin) => (
                <Marker
                  key={bin.id}
                  position={[bin.geometry.coordinates[1], bin.geometry.coordinates[0]]}
                  icon={new L.Icon.Default()}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{bin.properties.address}</p>
                      <p className="capitalize">{bin.properties.waste_type} waste</p>
                      <p className="capitalize text-ink/60">{bin.properties.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <MapStyleSwitch style={mapStyle} onChange={setMapStyle} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ink/70">
              {bins.length} bin{bins.length !== 1 ? 's' : ''} in your ward
            </h3>
            {bins.length === 0 && (
              <div className="bg-surface rounded-2xl border border-black/5 p-6 text-center text-sm text-ink/40">
                No bins found for your ward yet.
              </div>
            )}
            {bins.map((bin) => (
              <div
                key={bin.id}
                className="bg-surface rounded-xl border border-black/5 px-4 py-3 flex justify-between items-center"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{bin.properties.address}</p>
                  <p className="text-xs text-ink/50 capitalize">{bin.properties.waste_type} waste</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium capitalize bg-primary/10 text-primary shrink-0 ml-3">
                  {bin.properties.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}