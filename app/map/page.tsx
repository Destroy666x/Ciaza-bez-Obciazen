import { getLocations } from '@/lib/data';
import { MapPageClient } from '@/components/map-page-client';

export default function MapPage() {
  const locations = getLocations();

  return <MapPageClient locations={locations} />;
}
