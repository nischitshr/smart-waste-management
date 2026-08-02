import { TileLayer } from 'react-leaflet'
import { Map as MapIcon, Satellite } from 'lucide-react'

export type MapStyle = 'standard' | 'satellite'

// Free tile sources, no API key required.
// Standard: OpenStreetMap. Satellite: Esri World Imagery.
const TILE_CONFIG: Record<MapStyle, { url: string; attribution: string }> = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
}

/** Drop this inside <MapContainer> instead of a hardcoded <TileLayer>. */
export function StyledTileLayer({ style }: { style: MapStyle }) {
  const config = TILE_CONFIG[style]
  return <TileLayer url={config.url} attribution={config.attribution} />
}

/**
 * Floating toggle button — place as a sibling of <MapContainer> inside a
 * position-relative wrapper div, e.g.:
 *   <div className="relative rounded-2xl overflow-hidden" style={{ height: 400 }}>
 *     <MapContainer ...>
 *       <StyledTileLayer style={mapStyle} />
 *       ...
 *     </MapContainer>
 *     <MapStyleSwitch style={mapStyle} onChange={setMapStyle} />
 *   </div>
 */
export function MapStyleSwitch({
  style,
  onChange,
}: {
  style: MapStyle
  onChange: (s: MapStyle) => void
}) {
  return (
    <div className="absolute top-3 right-3 z-[1000] bg-white rounded-xl shadow-md border border-black/10 flex overflow-hidden text-xs font-medium">
      <button
        onClick={() => onChange('standard')}
        className={`flex items-center gap-1.5 px-3 py-2 transition ${
          style === 'standard' ? 'bg-primary text-white' : 'text-ink/60 hover:bg-black/5'
        }`}
      >
        <MapIcon className="w-3.5 h-3.5" /> Map
      </button>
      <button
        onClick={() => onChange('satellite')}
        className={`flex items-center gap-1.5 px-3 py-2 transition ${
          style === 'satellite' ? 'bg-primary text-white' : 'text-ink/60 hover:bg-black/5'
        }`}
      >
        <Satellite className="w-3.5 h-3.5" /> Satellite
      </button>
    </div>
  )
}