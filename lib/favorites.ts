const FAVORITE_LOCATIONS_STORAGE_KEY = 'favoriteLocations';

export function getStoredFavoriteLocationIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(FAVORITE_LOCATIONS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

export function setStoredFavoriteLocationIds(ids: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const uniqueIds = [...new Set(ids.filter(Boolean))];
  window.localStorage.setItem(FAVORITE_LOCATIONS_STORAGE_KEY, JSON.stringify(uniqueIds));
}

export function toggleStoredFavoriteLocationId(id: string): string[] {
  const currentIds = getStoredFavoriteLocationIds();
  const nextIds = currentIds.includes(id)
    ? currentIds.filter((entry) => entry !== id)
    : [...currentIds, id];

  setStoredFavoriteLocationIds(nextIds);
  return nextIds;
}
