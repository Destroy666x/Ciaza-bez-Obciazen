'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { ServiceLocation } from '@/lib/data';
import { useLocale } from '@/lib/client-i18n';
import { getStoredFavoriteLocationIds, setStoredFavoriteLocationIds } from '@/lib/favorites';

const categoryColors: Record<string, string> = {
  hospital: '#F00',
  pharmacy: '#DDD',
  gynecologist: '#8b5cf6',
  birthing_class: '#10b981',
  parenting_course: '#14b8a6',
  dietitian: '#f97316',
  psychologist: '#ec4899',
  physiotherapist: '#00008b',
  mops: '#3b82f6',
  store: '#7e7e7e',
};

const categoryOrder = ['hospital', 'pharmacy', 'gynecologist', 'birthing_class', 'parenting_course', 'dietitian', 'psychologist', 'physiotherapist', 'mops', 'store'];
const DEFAULT_CENTER = { lat: 52.237, lng: 19.017 };
const weekdayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const polandBounds = L.latLngBounds(L.latLng(49.0, 14.0), L.latLng(54.9, 24.2));

function normalizeOpeningHours(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function isLocationOpenNow(location: ServiceLocation): boolean {
  const schedule = location.opening_hours ?? {};
  const normalizedSchedule = Object.fromEntries(
    Object.entries(schedule).map(([day, value]) => [day.toLowerCase(), value])
  );

  const now = new Date();
  const currentDay = weekdayOrder[(now.getDay() + 6) % 7];
  const currentDayHours = normalizeOpeningHours(normalizedSchedule[currentDay]);

  if (currentDayHours.length === 0) {
    return false;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return currentDayHours.some((slot) => {
    const [startText, endText] = slot.split('-').map((part) => part.trim());

    if (!startText || !endText) {
      return false;
    }

    const startMinutes = parseTimeToMinutes(startText);
    const endMinutes = parseTimeToMinutes(endText);

    if (endMinutes <= startMinutes) {
      return nowMinutes >= startMinutes || nowMinutes < endMinutes;
    }

    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  });
}

function formatOpeningHours(location: ServiceLocation, dayLabels: Record<(typeof weekdayOrder)[number], string>, fallbackClosed: string): string {
  const schedule = location.opening_hours ?? {};

  const segments: { startDay: (typeof weekdayOrder)[number]; endDay: (typeof weekdayOrder)[number]; label: string }[] = [];
  let currentStart: (typeof weekdayOrder)[number] | null = null;
  let currentEnd: (typeof weekdayOrder)[number] | null = null;
  let currentValue: string | null = null;

  const finalizeSegment = () => {
    if (!currentStart || !currentEnd || currentValue === null) {
      return;
    }

    const dayRangeLabel = currentStart === currentEnd
      ? dayLabels[currentStart]
      : `${dayLabels[currentStart]}-${dayLabels[currentEnd]}`;

    segments.push({
      startDay: currentStart,
      endDay: currentEnd,
      label: `${dayRangeLabel} ${currentValue}`,
    });
  };

  for (const day of weekdayOrder) {
    const rawEntry = schedule[day];
    const normalizedValue = normalizeOpeningHours(rawEntry).join(' / ');

    if (!normalizedValue || normalizedValue.toLowerCase() === 'closed') {
      finalizeSegment();
      currentStart = null;
      currentEnd = null;
      currentValue = null;
      continue;
    }

    if (currentStart === null || currentEnd === null || currentValue === null || currentValue !== normalizedValue) {
      finalizeSegment();
      currentStart = day;
      currentEnd = day;
      currentValue = normalizedValue;
      continue;
    }

    currentEnd = day;
  }

  finalizeSegment();

  return segments.length > 0 ? segments.map((segment) => segment.label).join(' · ') : fallbackClosed;
}

function getMarkerIcon(type: ServiceLocation['type']) {
  const color = categoryColors[type] ?? '#8d5d9a';
  return L.divIcon({
    className: 'service-map-marker',
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.25);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function getUserLocationIcon() {
  return L.divIcon({
    className: 'user-location-marker',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:#ef4444;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.28);font-size:12px;line-height:1;">🧍</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10],
  });
}

function MapLocationPicker({
  onLocationSelect,
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleMapClick = (event: L.LeafletMouseEvent) => {
      const nextLocation = { lat: event.latlng.lat, lng: event.latlng.lng };
      if (
        nextLocation.lat >= 49.0 &&
        nextLocation.lat <= 54.9 &&
        nextLocation.lng >= 14.0 &&
        nextLocation.lng <= 24.2
      ) {
        onLocationSelect(nextLocation);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

function getDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRideLinks(place: ServiceLocation) {
  const destination = `${place.lat},${place.lng}`;
  const query = `?action=setPickup&pickup=my_location&dropoff[latitude]=${place.lat}&dropoff[longitude]=${place.lng}`;

  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    uberWeb: `https://m.uber.com/looking${query}`,
    boltWeb: `https://bolt.eu/en/`,
  };
}

function MapFlyTo({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 11, { animate: true, duration: 1.4 });
    }
  }, [center, map]);

  return null;
}

const HOME_LOCATION_STORAGE_KEY = 'homeLocation';

function getStoredHomeLocation(): { lat: number; lng: number } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedLocation = window.localStorage.getItem(HOME_LOCATION_STORAGE_KEY);
  if (!storedLocation) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedLocation) as Partial<{ lat: number; lng: number }>;
    if (
      typeof parsed?.lat === 'number' &&
      typeof parsed?.lng === 'number' &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng)
    ) {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch {
    return null;
  }

  return null;
}

export function ServiceMap({ locations }: { locations: ServiceLocation[] }) {
  const { locale, t } = useLocale();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [homeLocation, setHomeLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [zoom, setZoom] = useState<number>(6);
  const [locationError, setLocationError] = useState<string>('');
  const [openType, setOpenType] = useState<string | null>(categoryOrder[0]);
  const [radiusEnabled, setRadiusEnabled] = useState<boolean>(false);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    getStoredFavoriteLocationIds()
  );
  const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categoryOrder.map((type) => [type, true]))
  );

  const categoryLabels = useMemo<Record<string, string>>(
    () => ({
      hospital: t.map.categories.hospital,
      pharmacy: t.map.categories.pharmacy,
      gynecologist: t.map.categories.gynecologist,
      birthing_class: t.map.categories.birthing_class,
      parenting_course: t.map.categories.parenting_course,
      dietitian: t.map.categories.dietitian,
      psychologist: t.map.categories.psychologist,
      physiotherapist: t.map.categories.physiotherapist,
      mops: t.map.categories.mops,
      store: t.map.categories.store,
    }),
    [t]
  );

  const resolveLocationName = useCallback(async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        { headers: { 'Accept-Language': locale === 'pl' ? 'pl' : 'en' } }
      );
      const data = await response.json();
      const address = data?.address ?? {};

      const street =
        address.road ||
        address.pedestrian ||
        address.footway ||
        address.path ||
        address.residential ||
        address.street ||
        address.amenity ||
        '';

      const houseNumber = address.house_number || address.building || address.entrance || '';
      const locality =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.suburb ||
        address.county ||
        address.state ||
        address.country ||
        '';

      const streetWithNumber = street && houseNumber ? `${street} ${houseNumber}` : street || houseNumber;

      const nextCity =
        streetWithNumber && locality
          ? `${streetWithNumber}, ${locality}`
          : streetWithNumber || locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      setCityName(nextCity);
    } catch {
      setCityName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  }, [locale]);

  const updateCurrentLocation = useCallback((nextLocation: { lat: number; lng: number }) => {
    setUserLocation(nextLocation);
    setMapCenter(nextLocation);
    setSelectedLocationId(null);
    setZoom(11);
    void resolveLocationName(nextLocation.lat, nextLocation.lng);
  }, [resolveLocationName]);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError(t.map.locationAccessUnavailable);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateCurrentLocation({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {
        setLocationError(t.map.permissionDenied);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [t, updateCurrentLocation]);

  useEffect(() => {
    setHomeLocation(getStoredHomeLocation());
  }, []);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    setMapCenter((current) => userLocation ?? current ?? DEFAULT_CENTER);
  }, [userLocation]);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId]
  );

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      setZoom(11);
    }
  }, [selectedLocation]);

  const center = useMemo(() => userLocation ?? mapCenter, [userLocation, mapCenter]);

  const handleChooseLocation = useCallback((nextLocation: { lat: number; lng: number }) => {
    setUserLocation(nextLocation);
    setMapCenter(nextLocation);
    setSelectedLocationId(null);
    setZoom(14);
    void resolveLocationName(nextLocation.lat, nextLocation.lng);
  }, [resolveLocationName]);

  const sortedLocations = useMemo(() => {
    if (!userLocation) {
      return locations;
    }

    return [...locations].sort((a, b) => {
      const distanceA = getDistanceKm(userLocation, {
        lat: a.lat,
        lng: a.lng,
      });

      const distanceB = getDistanceKm(userLocation, {
        lat: b.lat,
        lng: b.lng,
      });

      return distanceA - distanceB;
    });
  }, [locations, userLocation]);

  const visibleLocations = useMemo(() => {
    const withinRadius = radiusEnabled && userLocation
      ? sortedLocations.filter(
          (location) => getDistanceKm(userLocation, { lat: location.lat, lng: location.lng }) <= radiusKm
        )
      : sortedLocations;

    const openOnly = showOpenOnly
      ? withinRadius.filter((location) => isLocationOpenNow(location))
      : withinRadius;

    return openOnly.filter((location) => activeTypes[location.type]);
  }, [activeTypes, radiusEnabled, radiusKm, showOpenOnly, sortedLocations, userLocation]);

  const allCategoriesVisible = categoryOrder.every((type) => activeTypes[type]);

  const useHomeLocation = () => {
    const nextLocation = getStoredHomeLocation();
    if (!nextLocation) {
      return;
    }

    setHomeLocation(nextLocation);
    setUserLocation(nextLocation);
    setMapCenter(nextLocation);
    setSelectedLocationId(null);
    setZoom(14);
    void resolveLocationName(nextLocation.lat, nextLocation.lng);
  };

  const toggleFavorite = (locationId: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(locationId)
        ? current.filter((entry) => entry !== locationId)
        : [...current, locationId];

      setStoredFavoriteLocationIds(next);

      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="card mobile-card rounded-[1.6rem] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{t.map.mapView}</div>
            <div className="mt-1 text-lg font-black text-[var(--brand-strong)]">
              {cityName ? t.map.currentLocation.replace('{value}', cityName) : t.map.locationNotShared}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void requestLocation()}
              className="rounded-full bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white"
            >
              {t.map.useMyLocation}
            </button>
            <button
              type="button"
              onClick={useHomeLocation}
              disabled={!homeLocation}
              className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.map.useHomeLocation}
            </button>
          </div>
        </div>
        {locationError && <p className="mt-3 text-sm text-[var(--muted)]">{locationError}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <div className="card mobile-card overflow-hidden rounded-[1.6rem] p-2">
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={zoom}
              scrollWheelZoom
              maxBounds={polandBounds}
              maxBoundsViscosity={1.0}
              minZoom={5}
              maxZoom={18}
              className="h-[480px] w-full rounded-[1.2rem]"
              style={{ height: '480px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapLocationPicker onLocationSelect={handleChooseLocation} />
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={getUserLocationIcon()}>
                  <Popup>
                    <div className="space-y-2 text-sm">
                      <div className="font-bold text-[var(--brand-strong)]">Your chosen location</div>
                      <div>{cityName || t.map.locationNotShared}</div>
                    </div>
                  </Popup>
                </Marker>
              )}
              <MapFlyTo center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : mapCenter} />
              {visibleLocations.map((location) => (
                <Marker key={location.id} position={[location.lat, location.lng]} icon={getMarkerIcon(location.type)}>
                  <Popup>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-[var(--brand-strong)]">{location.name}</div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleFavorite(location.id);
                          }}
                          className="text-xl leading-none text-[var(--brand-strong)]"
                          aria-label={favoriteIds.includes(location.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favoriteIds.includes(location.id) ? '♥' : '♡'}
                        </button>
                      </div>
                      <div>{location.city} · {location.address}</div>
                      <div className="text-[var(--muted)]">{categoryLabels[location.type] ?? location.type}</div>
                      <div className="text-[var(--brand-strong)]">★ {location.rating}</div>
                      <div className="text-xs font-semibold text-[var(--muted)]">
                        {isLocationOpenNow(location) ? t.map.openNow : t.map.closedNow}
                      </div>
                      <div className="text-xs text-[var(--muted)]">{t.map.hours}: {formatOpeningHours(location, t.map.days, t.map.closedNow)}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                        <a href={getRideLinks(location).google} target="_blank" rel="noreferrer" className="rounded-full bg-[var(--brand-strong)] px-3 py-1.5 text-white">
                          Google Maps
                        </a>
                        <a href={getRideLinks(location).uberWeb} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[var(--brand-strong)]">
                          {t.map.uber}
                        </a>
                        <a href={getRideLinks(location).boltWeb} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[var(--brand-strong)]">
                          {t.map.bolt}
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="card mobile-card rounded-[1.5rem] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{t.map.radiusFilter}</div>
                <div className="mt-1 text-lg font-black text-[var(--brand-strong)]">
                  {radiusEnabled && userLocation ? `${radiusKm} km` : t.map.allLocations}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                <span>{t.map.enableRadiusFilter}</span>
                <input
                  type="checkbox"
                  checked={radiusEnabled}
                  onChange={() => setRadiusEnabled((current) => !current)}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 25, 50, 100].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRadiusKm(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    radiusKm === option
                      ? 'bg-[var(--brand-strong)] text-white'
                      : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--brand-strong)]'
                  }`}
                  disabled={!radiusEnabled || !userLocation}
                >
                  {option} km
                </button>
              ))}
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={radiusKm}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
              className="mt-4 w-full accent-[var(--brand)]"
              disabled={!radiusEnabled || !userLocation}
            />
          </div>

          <div className="card mobile-card rounded-[1.5rem] p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[var(--brand-strong)]">{t.map.onlyOpenBusinesses}</span>
              <input
                type="checkbox"
                checked={showOpenOnly}
                onChange={() => setShowOpenOnly((current) => !current)}
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card mobile-card rounded-[1.5rem] p-4">
            <button
              type="button"
              onClick={() => setActiveTypes(Object.fromEntries(categoryOrder.map((type) => [type, true])))}
              className="w-full rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] disabled:opacity-50"
              disabled={allCategoriesVisible}
            >
              {t.map.showAllCategories}
            </button>
          </div>

          {categoryOrder.map((type) => {
            const categoryItems = sortedLocations.filter((place) => place.type === type);
            const isOpen = openType === type;
            const label = categoryLabels[type] ?? type;

            return (
              <section key={type} className="card mobile-card rounded-[1.5rem] p-4">
                <div className="mb-3 flex w-full items-center justify-between gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => setOpenType(isOpen ? null : type)}
                    className="flex flex-1 items-center justify-between gap-2 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ background: categoryColors[type] ?? '#8d5d9a' }} />
                      <h2 className="text-lg font-extrabold text-[var(--brand-strong)]">{label}</h2>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{categoryItems.length}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenType(isOpen ? null : type)}
                      className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-lg font-bold text-[var(--brand-strong)] leading-none"
                      aria-label={isOpen ? t.common.collapse : t.common.expand}
                    >
                      {isOpen ? '▴' : '▾'}
                    </button>
                    <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                      <input
                        type="checkbox"
                        checked={Boolean(activeTypes[type])}
                        onChange={() => setActiveTypes((current) => ({ ...current, [type]: !current[type] }))}
                      />
                      <span className="sr-only">{label}</span>
                    </label>
                  </div>
                </div>

                {isOpen && (
                  <div className="space-y-3">
                    {categoryItems.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">{t.map.locationNotShared}</p>
                    ) : (
                      categoryItems.map((place) => {
                        const rideLinks = getRideLinks(place);
                        return (
                          <div
                            key={place.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedLocationId(place.id);
                              setMapCenter({ lat: place.lat, lng: place.lng });
                              setZoom(11);
                              setOpenType(type);
                            }}
                            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-left transition hover:border-[var(--brand)]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-[var(--brand-strong)]">{place.name}</h3>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleFavorite(place.id);
                                  }}
                                  className="text-xl leading-none text-[var(--brand-strong)]"
                                  aria-label={favoriteIds.includes(place.id) ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                  {favoriteIds.includes(place.id) ? '♥' : '♡'}
                                </button>
                                <span className="rounded-full bg-[var(--butter)] px-2 py-1 text-xs font-semibold text-[var(--brand-strong)]">★ {place.rating}</span>
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-[var(--muted)]">{place.city} · {place.address}</p>
                            <div className="mt-2 text-xs font-semibold text-[var(--muted)]">
                              {isLocationOpenNow(place) ? t.map.openNow : t.map.closedNow}
                            </div>
                            <div className="mt-1 text-xs text-[var(--muted)]">{t.map.hours}: {formatOpeningHours(place, t.map.days, t.map.closedNow)}</div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                              <a href={rideLinks.google} target="_blank" rel="noreferrer" className="rounded-full bg-[var(--brand-strong)] px-3 py-1.5 text-white" onClick={(event) => event.stopPropagation()}>
                                Google Maps
                              </a>
                              <a href={rideLinks.uberWeb} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[var(--brand-strong)]" onClick={(event) => event.stopPropagation()}>
                                {t.map.uber}
                              </a>
                              <a href={rideLinks.boltWeb} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[var(--brand-strong)]" onClick={(event) => event.stopPropagation()}>
                                {t.map.bolt}
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
