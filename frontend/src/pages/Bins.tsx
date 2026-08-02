import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/axios'
import { StyledTileLayer, MapStyleSwitch } from '../components/MapStyleToggle'
import type { MapStyle } from '../components/MapStyleToggle'

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Bin {
  id: number
  properties: {
    address: string
    waste_type: string
    status: string
  }
  geometry: {
    coordinates: [number, number]
  }
}

export default function Bins() {
  const [bins, setBins] = useState<Bin[]>([])
  const [userLocation, setUserLocation] = useState<[number, number]>([27.7172, 85.3240])
  const [loading, setLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard')

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
  }, [])

  const fetchBins = async (lat: number, lng: number) => {
    try {
      const res = await api.get(`/bins/?lat=${lat}&lng=${lng}`)
      setBins(res.data.results?.features || [])
    } catch (err) {
      console.error('fetchBins error', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Finding bins near you...</p>
          </div>
        ) : (
          <>
            <div className="relative rounded-2xl overflow-hidden shadow-md mb-6" style={{ height: '400px' }}>
              <MapContainer center={userLocation} zoom={15} style={{ height: '100%', width: '100%' }}>
                <StyledTileLayer style={mapStyle} />
                <Circle center={userLocation} radius={500} color="green" fillOpacity={0.1} />
                {bins.map((bin) => (
                  <Marker
                    key={bin.id}
                    position={[bin.geometry.coordinates[1], bin.geometry.coordinates[0]]}
                    icon={new L.Icon.Default()}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{bin.properties.address}</p>
                        <p>Type: {bin.properties.waste_type}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <MapStyleSwitch style={mapStyle} onChange={setMapStyle} />
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
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}