import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/axios'

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// const highPriorityIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// })
// ^ high-priority (red) marker was driven by fill_level >= 80. Commented out
// alongside fill_level since there's no hardware sensor data to compute it from yet.
// Re-enable when fill_level tracking (manual or sensor-based) is implemented.



interface Bin {
  id: number
  properties: {
    address: string
    // fill_level: number       // commented out — no hardware sensors yet, future enhancement
    waste_type: string
    status: string
    // is_high_priority: boolean // depends on fill_level, commented out alongside it
  }
  geometry: {
    coordinates: [number, number]
  }
}

export default function Bins() {
  const [bins, setBins] = useState<Bin[]>([])
  const [userLocation, setUserLocation] = useState<[number, number]>([27.7172, 85.3240])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
  console.log('Bins useEffect fired')
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log('Geolocation success', pos.coords)
      const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
      setUserLocation(coords)
      fetchBins(coords[0], coords[1])
    },
    (err) => {
      console.log('Geolocation error', err)
      fetchBins(27.7172, 85.3240)
    }
  )
}, [])

const fetchBins = async (lat: number, lng: number) => {
  console.log('fetchBins called with', lat, lng)
  try {
    const res = await api.get(`/bins/?lat=${lat}&lng=${lng}`)
    console.log('fetchBins response', res.data)
    setBins(res.data.results?.features || [])
  } catch (err) {
    console.error('fetchBins error', err)
  } finally {
    setLoading(false)
  }
}

  // const getFillColor = (level: number) => {
  //   if (level >= 80) return 'text-red-600'
  //   if (level >= 50) return 'text-yellow-600'
  //   return 'text-green-600'
  // }
  // ^ commented out alongside fill_level. Re-enable when fill_level is back.

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Finding bins near you...</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden shadow-md mb-6" style={{ height: '400px' }}>
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
                    icon={new L.Icon.Default()}
                    // icon={bin.properties.is_high_priority ? highPriorityIcon : new L.Icon.Default()}
                    // ^ high-priority icon swap commented out alongside fill_level
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{bin.properties.address}</p>
                        <p>Type: {bin.properties.waste_type}</p>
                        {/* <p className={getFillColor(bin.properties.fill_level)}>
                          Fill level: {bin.properties.fill_level}%
                        </p> */}
                        {/* {bin.properties.is_high_priority && (
                          <p className="text-red-600 font-bold">⚠️ High Priority</p>
                        )} */}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700">
                {bins.length} bin{bins.length !== 1 ? 's' : ''} found nearby
              </h2>
              {bins.length === 0 && (
                <div className="bg-white rounded-xl p-6 text-center text-gray-500 shadow">
                  No bins found within 500m. Try adding some bins via the admin panel.
                </div>
              )}
              {bins.map((bin) => (
                <div key={bin.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{bin.properties.address}</p>
                    <p className="text-sm text-gray-500 capitalize">{bin.properties.waste_type} waste</p>
                  </div>
                  {/* <div className="text-right">
                    <p className={`font-bold text-lg ${getFillColor(bin.properties.fill_level)}`}>
                      {bin.properties.fill_level}%
                    </p>
                    <p className="text-xs text-gray-400">fill level</p>
                  </div> */}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>

  )
}