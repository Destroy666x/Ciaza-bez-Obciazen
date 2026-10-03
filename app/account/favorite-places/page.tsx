import { getLocations } from '@/lib/data';
import { FavoritePlacesPageClient } from '@/components/favorite-places-page-client';

export default function FavoritePlacesPage() {
  const locations = getLocations();

  return <FavoritePlacesPageClient locations={locations} />;
}