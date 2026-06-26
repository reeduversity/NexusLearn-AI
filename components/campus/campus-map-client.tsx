'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Locate } from 'lucide-react'

interface CampusLocation {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  type?: string
}

const TYPE_COLORS: Record<string, string> = {
  building: '#3b82f6',
  library: '#8b5cf6',
  lab: '#10b981',
  cafeteria: '#f59e0b',
  default: '#6366f1',
}

// Default center: IIT Delhi coordinates as a representative campus
const DEFAULT_CENTER: [number, number] = [28.5459, 77.1926]
const DEFAULT_ZOOM = 16

interface CampusMapProps {
  locations: CampusLocation[]
}

export function CampusMapClient({ locations }: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [activeLocation, setActiveLocation] = useState<CampusLocation | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const markersRef = useRef<any[]>([])

  // seed 3 demo markers if DB is empty
  const effectiveLocations: CampusLocation[] =
    locations.length > 0
      ? locations
      : [
          { id: 'd1', name: 'Main Library', description: 'Central library with 24/7 access', latitude: 28.5462, longitude: 77.1930, type: 'library' },
          { id: 'd2', name: 'Computer Science Block', description: 'Department of CS & AI', latitude: 28.5455, longitude: 77.1915, type: 'building' },
          { id: 'd3', name: 'Student Cafeteria', description: 'Food court open 7am–10pm', latitude: 28.5448, longitude: 77.1940, type: 'cafeteria' },
        ]

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import leaflet (client-only)
    import('leaflet').then((L) => {
      // Fix default icon path for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = effectiveLocations.length > 0
        ? [effectiveLocations[0].latitude, effectiveLocations[0].longitude] as [number, number]
        : DEFAULT_CENTER

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(center, DEFAULT_ZOOM)
      mapInstanceRef.current = map

      // OpenStreetMap tiles (free, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add markers for each campus location
      effectiveLocations.forEach((loc) => {
        const color = TYPE_COLORS[loc.type || 'default'] || TYPE_COLORS.default
        const icon = L.divIcon({
          html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
            <div style="transform:rotate(45deg);font-size:12px;">📍</div>
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -30],
        })

        const marker = L.marker([loc.latitude, loc.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:150px;">
              <strong style="font-size:14px;color:#1e293b">${loc.name}</strong>
              ${loc.description ? `<p style="font-size:12px;color:#64748b;margin:4px 0 0">${loc.description}</p>` : ''}
              <p style="font-size:11px;color:#94a3b8;margin:4px 0 0">${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}</p>
            </div>`,
            { maxWidth: 250 }
          )

        marker.on('click', () => setActiveLocation(loc))
        markersRef.current.push(marker)
      })

      setMapReady(true)
    })

    // Load leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Locate user and fly to position
  const handleLocate = () => {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserPos([latitude, longitude])
        if (mapInstanceRef.current) {
          import('leaflet').then((L) => {
            const userIcon = L.divIcon({
              html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
              className: '',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })
            L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup('<strong>You are here</strong>')
              .openPopup()
            mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 1.5 })
          })
        }
        setIsLocating(false)
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="space-y-4">
      {/* Map controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLocate}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
          id="locate-me-btn"
        >
          {isLocating ? (
            <Navigation className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
          My Location
        </button>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {effectiveLocations.length} location{effectiveLocations.length !== 1 ? 's' : ''} on map
        </span>
        {!mapReady && (
          <span className="text-xs text-indigo-500 animate-pulse">Loading map…</span>
        )}
      </div>

      {/* Leaflet Map container */}
      <div
        ref={mapRef}
        id="campus-leaflet-map"
        className="h-[450px] w-full rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm z-0"
        style={{ background: '#e5e7eb' }}
      />

      {/* Active location detail */}
      {activeLocation && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-indigo-800 dark:text-indigo-300">{activeLocation.name}</p>
            {activeLocation.description && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">{activeLocation.description}</p>
            )}
            <p className="text-xs text-indigo-400 mt-1">
              {activeLocation.latitude.toFixed(5)}, {activeLocation.longitude.toFixed(5)}
            </p>
          </div>
          <button onClick={() => setActiveLocation(null)} className="ml-auto text-indigo-400 hover:text-indigo-600 text-xs">✕</button>
        </div>
      )}

      {/* Location cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {effectiveLocations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => {
              setActiveLocation(loc)
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 17, { duration: 1 })
              }
            }}
            className="flex items-start rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 text-left shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div
              className="mt-0.5 h-3 w-3 rounded-full shrink-0"
              style={{ background: TYPE_COLORS[loc.type || 'default'] || TYPE_COLORS.default }}
            />
            <div className="ml-3 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{loc.name}</p>
              {loc.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{loc.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
