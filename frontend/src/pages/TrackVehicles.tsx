import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Truck } from 'lucide-react'
import api from '../api/axios'

// Fix Leaflet default icon issue with Vite (safe to repeat — idempotent)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const statusIcon: Record<string, L.Icon> = {
  available: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  on_route: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  maintenance: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
}

interface Vehicle {
  id: number
  driver: number | null
  driver_name: string | null
  plate_number: string
  capacity_tons: number
  status: 'available' | 'on_route' | 'maintenance'
}

interface GPSFeature {
  id: number
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    vehicle: number
    plate_number: string
    recorded_at: string
  }
}

const WARD_15_CENTER: [number, number] = [27.6947, 85.3125]

export default function TrackVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [positions, setPositions] = useState<GPSFeature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vehiclesRes, gpsRes] = await Promise.all([
        api.get('/routes/vehicles/'),
        api.get('/routes/gps/latest/'),
      ])
      setVehicles(vehiclesRes.data.results || [])
      setPositions(gpsRes.data.results?.features || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'available') return 'bg-primary/10 text-primary'
    if (status === 'on_route') return 'bg-warning/10 text-warning'
    return 'bg-danger/10 text-danger'
  }

  const positionFor = (vehicleId: number) =>
    positions.find((p) => p.properties.vehicle === vehicleId)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1">Track Vehicles</h2>
      <p className="text-ink/60 mb-6">Live positions of collection vehicles in Ward 15.</p>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-ink/40">Loading vehicle data...</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden shadow-sm border border-black/5 mb-6" style={{ height: '400px' }}>
            <MapContainer center={WARD_15_CENTER} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {positions.map((pos) => {
                const vehicle = vehicles.find((v) => v.id === pos.properties.vehicle)
                return (
                  <Marker
                    key={pos.id}
                    position={[pos.geometry.coordinates[1], pos.geometry.coordinates[0]]}
                    icon={statusIcon[vehicle?.status || 'available']}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{pos.properties.plate_number}</p>
                        {vehicle?.driver_name && <p>Driver: {vehicle.driver_name}</p>}
                        {vehicle && <p className="capitalize">Status: {vehicle.status.replace('_', ' ')}</p>}
                        <p className="text-xs text-ink/50">
                          Updated {new Date(pos.properties.recorded_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>

          <h3 className="font-semibold text-ink mb-3">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in the fleet
          </h3>
          <div className="space-y-3">
            {vehicles.length === 0 && (
              <div className="bg-surface rounded-xl p-6 text-center text-ink/40 border border-black/5">
                No vehicles registered yet. Add one via the admin panel.
              </div>
            )}
            {vehicles.map((v) => {
              const pos = positionFor(v.id)
              return (
                <div
                  key={v.id}
                  className="bg-surface rounded-xl p-4 border border-black/5 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{v.plate_number}</p>
                      <p className="text-xs text-ink/50">
                        {v.driver_name || 'Unassigned'} · {v.capacity_tons}t capacity
                      </p>
                      {!pos && <p className="text-xs text-ink/30 mt-0.5">No GPS signal yet</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${statusColor(v.status)}`}>
                    {v.status.replace('_', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
