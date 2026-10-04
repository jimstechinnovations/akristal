'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { formatMoney } from '@/lib/format'

export type MapListing = {
  id: string
  title: string
  price: number
  currency: string
  listingType: 'sale' | 'rent'
  image: string | null
  place: string
  lat: number
  lng: number
  approximate: boolean
}

function pinIcon(l: MapListing) {
  const label = formatMoney(l.price, l.currency, { compact: true })
  return L.divIcon({
    className: '',
    html: `<span class="ak-pin${l.approximate ? ' ak-pin--approx' : ''}">${label}</span>`,
    iconSize: undefined,
    iconAnchor: [0, 0],
  })
}

function FitToPins({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) map.setView(points[0], 13)
    else map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 })
  }, [map, points])
  return null
}

export default function LeafletMap({ listings }: { listings: MapListing[] }) {
  const points = useMemo(() => listings.map((l) => [l.lat, l.lng] as [number, number]), [listings])
  // OpenStreetMap's standard tiles (attribution required; fine for this traffic level).
  // For heavy traffic, switch to a keyed provider here. Dark mode is a CSS filter (globals.css).
  const tiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <MapContainer center={[-1.9441, 30.0619]} zoom={4} scrollWheelZoom className="size-full" attributionControl>
      <TileLayer
        key={tiles}
        url={tiles}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <FitToPins points={points} />
      {listings.map((l) => (
        <Marker key={l.id} position={[l.lat, l.lng]} icon={pinIcon(l)} title={`${l.title}, ${formatMoney(l.price, l.currency)}`}>
          <Popup minWidth={240} maxWidth={260}>
            <Link href={`/properties/${l.id}`} className="ak-popup">
              {l.image && (
                // eslint-disable-next-line @next/next/no-img-element -- Leaflet popups render outside React's image pipeline
                <img src={l.image} alt="" loading="lazy" />
              )}
              <span className="ak-popup__body">
                <strong>
                  {formatMoney(l.price, l.currency)}
                  {l.listingType === 'rent' ? ' / month' : ''}
                </strong>
                <span>{l.title}</span>
                <small>
                  {l.place}
                  {l.approximate ? ' (approximate area)' : ''}
                </small>
              </span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
