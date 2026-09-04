/**
 * Geographic distance calculations and German postal code coordinates resolver
 */

// Coordinates table for major German cities and postal code regions
const GERMAN_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // Karlsruhe & Region
  '76139': { lat: 49.0308, lon: 8.4487 }, // Karlsruhe Waldstadt / Hagsfeld
  '76137': { lat: 49.0016, lon: 8.4116 }, // Karlsruhe Südstadt
  '76131': { lat: 49.0140, lon: 8.4230 }, // Karlsruhe Oststadt
  '76133': { lat: 49.0094, lon: 8.4044 }, // Karlsruhe Innenstadt
  '76135': { lat: 49.0028, lon: 8.3842 }, // Karlsruhe Weststadt
  'karlsruhe': { lat: 49.0069, lon: 8.4037 },
  'ettlingen': { lat: 48.9416, lon: 8.4080 },
  'rastatt': { lat: 48.8575, lon: 8.2045 },
  'baden-baden': { lat: 48.7606, lon: 8.2398 },
  '76530': { lat: 48.7606, lon: 8.2398 },
  'pforzheim': { lat: 48.8932, lon: 8.6988 },
  '75175': { lat: 48.8932, lon: 8.6988 },
  'stuttgart': { lat: 48.7758, lon: 9.1829 },
  '70173': { lat: 48.7758, lon: 9.1829 },
  'mannheim': { lat: 49.4875, lon: 8.4660 },
  '68159': { lat: 49.4875, lon: 8.4660 },
  'heidelberg': { lat: 49.3988, lon: 8.6724 },
  '69117': { lat: 49.3988, lon: 8.6724 },
  'freiburg': { lat: 47.9990, lon: 7.8421 },
  '79098': { lat: 47.9990, lon: 7.8421 },

  // Big German Metropolises
  'berlin': { lat: 52.5200, lon: 13.4050 },
  '10115': { lat: 52.5323, lon: 13.3846 },
  '10178': { lat: 52.5218, lon: 13.4132 },
  '10405': { lat: 52.5366, lon: 13.4216 },
  'münchen': { lat: 48.1371, lon: 11.5761 },
  'munchen': { lat: 48.1371, lon: 11.5761 },
  '80331': { lat: 48.1371, lon: 11.5761 },
  '80802': { lat: 48.1611, lon: 11.5905 },
  'hamburg': { lat: 53.5511, lon: 9.9937 },
  '20095': { lat: 53.5511, lon: 9.9937 },
  '22303': { lat: 53.5932, lon: 10.0152 },
  'köln': { lat: 50.9375, lon: 6.9603 },
  'koln': { lat: 50.9375, lon: 6.9603 },
  '50667': { lat: 50.9375, lon: 6.9603 },
  'frankfurt': { lat: 50.1109, lon: 8.6821 },
  'frankfurt am main': { lat: 50.1109, lon: 8.6821 },
  '60311': { lat: 50.1109, lon: 8.6821 },
  'düsseldorf': { lat: 51.2277, lon: 6.7735 },
  'dusseldorf': { lat: 51.2277, lon: 6.7735 },
  '40213': { lat: 51.2277, lon: 6.7735 },
  'leipzig': { lat: 51.3397, lon: 12.3731 },
  '04109': { lat: 51.3397, lon: 12.3731 },
  'dortmund': { lat: 51.5136, lon: 7.4653 },
  '44135': { lat: 51.5136, lon: 7.4653 },
  'essen': { lat: 51.4556, lon: 7.0116 },
  '45127': { lat: 51.4556, lon: 7.0116 },
  'bremen': { lat: 53.0793, lon: 8.8017 },
  '28195': { lat: 53.0793, lon: 8.8017 },
  'dresden': { lat: 51.0504, lon: 13.7373 },
  '01067': { lat: 51.0504, lon: 13.7373 },
  'hannover': { lat: 52.3759, lon: 9.7320 },
  '30159': { lat: 52.3759, lon: 9.7320 },
  'nürnberg': { lat: 49.4521, lon: 11.0767 },
  'nurnberg': { lat: 49.4521, lon: 11.0767 },
  '90402': { lat: 49.4521, lon: 11.0767 },
};

/**
 * Calculates Great-Circle distance in kilometers between two latitude/longitude points (Haversine Formula)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Resolves approximate latitude/longitude for a given city name or PLZ
 */
export function getCoordinatesForLocation(locationStr: string): { lat: number; lon: number } | null {
  if (!locationStr) return null;
  const clean = locationStr.toLowerCase().trim();

  // 1. Direct match
  if (GERMAN_COORDINATES[clean]) {
    return GERMAN_COORDINATES[clean];
  }

  // 2. Extract postal code if inside parentheses e.g. "Karlsruhe (76139)"
  const plzMatch = clean.match(/\b(\d{5})\b/);
  if (plzMatch && GERMAN_COORDINATES[plzMatch[1]]) {
    return GERMAN_COORDINATES[plzMatch[1]];
  }

  // 3. Match city substring
  for (const [key, coords] of Object.entries(GERMAN_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }

  // 4. Fallback region estimation by first 2 digits of PLZ
  if (plzMatch) {
    const prefix2 = plzMatch[1].substring(0, 2);
    if (prefix2 === '76') return { lat: 49.0069, lon: 8.4037 }; // Karlsruhe area
    if (prefix2 === '70' || prefix2 === '71') return { lat: 48.7758, lon: 9.1829 }; // Stuttgart area
    if (prefix2 === '80' || prefix2 === '81') return { lat: 48.1371, lon: 11.5761 }; // Munich area
    if (prefix2 === '10') return { lat: 52.5200, lon: 13.4050 }; // Berlin area
    if (prefix2 === '20') return { lat: 53.5511, lon: 9.9937 }; // Hamburg area
    if (prefix2 === '50') return { lat: 50.9375, lon: 6.9603 }; // Cologne area
    if (prefix2 === '60') return { lat: 50.1109, lon: 8.6821 }; // Frankfurt area
  }

  return null;
}

/**
 * Calculates distance from user's current/saved location to a listing
 */
export function getDistanceTo(
  userLocation: string | null | undefined,
  listingCity: string,
  listingPlz?: string
): { km: number; formatted: string } | null {
  if (!userLocation) return null;

  const userCoords = getCoordinatesForLocation(userLocation);
  if (!userCoords) return null;

  const targetStr = [listingPlz, listingCity].filter(Boolean).join(' ');
  const listingCoords = getCoordinatesForLocation(targetStr);
  if (!listingCoords) return null;

  const dist = calculateHaversineDistance(
    userCoords.lat,
    userCoords.lon,
    listingCoords.lat,
    listingCoords.lon
  );

  if (dist <= 1.5) {
    return { km: dist, formatted: 'In deiner Nähe' };
  }
  return { km: dist, formatted: `${dist} km` };
}
