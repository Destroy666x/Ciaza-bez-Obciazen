'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

const POLAND_BOUNDS = L.latLngBounds(L.latLng(49.0, 14.0), L.latLng(54.9, 24.2));
const homeLocationIcon = L.divIcon({
  className: 'home-location-marker',
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:#f7dfe5;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:16px;line-height:1;">🏠</div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

type HomeLocation = { lat: number; lng: number };

function MapHomePicker({ value, onChange }: { value: HomeLocation; onChange: (location: HomeLocation) => void }) {
  const map = useMap();

  useEffect(() => {
    map.setView([value.lat, value.lng], 6);
  }, [map, value]);

  useEffect(() => {
    const handleMapClick = (event: L.LeafletMouseEvent) => {
      const nextLocation = { lat: event.latlng.lat, lng: event.latlng.lng };
      if (
        nextLocation.lat >= 49.0 &&
        nextLocation.lat <= 54.9 &&
        nextLocation.lng >= 14.0 &&
        nextLocation.lng <= 24.2
      ) {
        onChange(nextLocation);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onChange]);

  return <Marker position={[value.lat, value.lng]} icon={homeLocationIcon} />;
}

export function HomeLocationMap({ value, onChange }: { value: HomeLocation; onChange: (location: HomeLocation) => void }) {
  return (
    <MapContainer
      center={[value.lat, value.lng]}
      zoom={6}
      scrollWheelZoom
      maxBounds={POLAND_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={5}
      maxZoom={18}
      className="w-full"
      style={{ height: 'min(55vh, 480px)', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapHomePicker value={value} onChange={onChange} />
    </MapContainer>
  );
}
