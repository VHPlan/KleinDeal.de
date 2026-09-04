import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TOP_GERMAN_CITIES = [
  { city: 'Berlin', plz: '10115', state: 'Berlin' },
  { city: 'München', plz: '80331', state: 'Bayern' },
  { city: 'Hamburg', plz: '20095', state: 'Hamburg' },
  { city: 'Köln', plz: '50667', state: 'Nordrhein-Westfalen' },
  { city: 'Frankfurt am Main', plz: '60311', state: 'Hessen' },
  { city: 'Stuttgart', plz: '70173', state: 'Baden-Württemberg' },
  { city: 'Düsseldorf', plz: '40213', state: 'Nordrhein-Westfalen' },
  { city: 'Leipzig', plz: '04109', state: 'Sachsen' },
  { city: 'Dortmund', plz: '44135', state: 'Nordrhein-Westfalen' },
  { city: 'Essen', plz: '45127', state: 'Nordrhein-Westfalen' },
  { city: 'Bremen', plz: '28195', state: 'Bremen' },
  { city: 'Dresden', plz: '01067', state: 'Sachsen' },
  { city: 'Hannover', plz: '30159', state: 'Niedersachsen' },
  { city: 'Nürnberg', plz: '90402', state: 'Bayern' },
  { city: 'Karlsruhe', plz: '76131', state: 'Baden-Württemberg' },
  { city: 'Baden-Baden', plz: '76530', state: 'Baden-Württemberg' },
  { city: 'Rastatt', plz: '76437', state: 'Baden-Württemberg' },
  { city: 'Mannheim', plz: '68159', state: 'Baden-Württemberg' },
  { city: 'Freiburg im Breisgau', plz: '79098', state: 'Baden-Württemberg' },
  { city: 'Heidelberg', plz: '69117', state: 'Baden-Württemberg' },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    const headers = {
      'User-Agent': 'KleinDeal-Marketplace/1.0 (contact@kleindeal.de)',
      'Accept': 'application/json',
    };

    // Handle Precise Reverse Geocoding (Meinen Standort verwenden)
    if (lat && lon) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);

      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        return NextResponse.json({ success: false, message: 'Invalid coordinates' }, { status: 400 });
      }

      // 1. First choice: OpenStreetMap Nominatim for exact address resolution
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${parsedLat}&lon=${parsedLon}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'KleinDeal-Marketplace/1.0 (contact@kleindeal.de)',
              'Accept': 'application/json',
              'Accept-Language': 'de, en;q=0.8',
            },
            signal: AbortSignal.timeout(4500),
            cache: 'no-store',
          }
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          const addr = nomData.address || {};
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.suburb ||
            addr.city_district ||
            addr.county ||
            addr.state_district ||
            nomData.name;
          const plz = addr.postcode || '';
          const state = addr.state || '';
          const country = addr.country || 'Deutschland';

          if (city) {
            const full = plz ? `${city} (${plz})` : city;
            const secondary = [state, country].filter(Boolean).join(', ');
            return NextResponse.json({
              success: true,
              result: {
                city,
                plz,
                state,
                country,
                primary: full,
                secondary,
                full,
                lat: parsedLat,
                lon: parsedLon,
              },
            });
          }
        }
      } catch (nomErr: any) {
        console.warn('Nominatim reverse lookup notice:', nomErr?.message);
      }

      // 2. Second choice: BigDataCloud Reverse Geocoding API (Fast and highly accurate global client)
      try {
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${parsedLat}&longitude=${parsedLon}&localityLanguage=de`,
          { signal: AbortSignal.timeout(4000), cache: 'no-store' }
        );
        if (bdcRes.ok) {
          const bdc = await bdcRes.json();
          const city = bdc.city || bdc.locality || bdc.principalSubdivision || '';
          const plz = bdc.postcode || '';
          const state = bdc.principalSubdivision || '';
          const country = bdc.countryName || 'Deutschland';

          if (city) {
            const full = plz ? `${city} (${plz})` : city;
            const secondary = [state, country].filter(Boolean).join(', ');
            return NextResponse.json({
              success: true,
              result: {
                city,
                plz,
                state,
                country,
                primary: full,
                secondary,
                full,
                lat: parsedLat,
                lon: parsedLon,
              },
            });
          }
        }
      } catch (bdcErr: any) {
        console.warn('BigDataCloud reverse lookup notice:', bdcErr?.message);
      }

      // 3. Fallback: Photon Komoot API
      try {
        const revRes = await fetch(
          `https://photon.komoot.io/reverse?lat=${parsedLat}&lon=${parsedLon}`,
          { headers, cache: 'no-store', signal: AbortSignal.timeout(4000) }
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          const first = revData.features?.[0]?.properties;
          if (first) {
            const city = first.city || first.town || first.village || first.county || first.name || 'Mein Standort';
            const plz = first.postcode || '';
            const state = first.state || '';
            const country = first.country || 'Deutschland';
            const full = plz ? `${city} (${plz})` : city;
            return NextResponse.json({
              success: true,
              result: {
                city,
                plz,
                state,
                country,
                primary: full,
                secondary: [state, country].filter(Boolean).join(', '),
                full,
                lat: parsedLat,
                lon: parsedLon,
              },
            });
          }
        }
      } catch (e: any) {
        console.error('Error in reverse geocoding fallback:', e?.message);
      }

      return NextResponse.json({ success: false, message: 'Could not reverse geocode' });
    }

    if (!q || q.length < 1) {
      return NextResponse.json({ results: [] });
    }

    const cleanQ = q.toLowerCase();

    // 1. Query Photon geocoding API for live real-time places across all of Germany
    let remoteMatches: any[] = [];
    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&countrycodes=de&lang=de`,
        { headers, cache: 'no-store' }
      );
      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (Array.isArray(photonData.features)) {
          remoteMatches = photonData.features.map((f: any) => {
            const p = f.properties || {};
            const city = p.city || p.town || p.village || p.county || p.name || q;
            const plz = p.postcode || '';
            const state = p.state || '';
            const district = p.district || p.suburb || '';
            
            let primary = city;
            if (district && district !== city) {
              primary = `${city} (${district})`;
            } else if (plz) {
              primary = `${city} (${plz})`;
            }

            const secondaryParts = [state, 'Deutschland'].filter(Boolean);

            return {
              city,
              plz,
              state,
              primary,
              secondary: secondaryParts.join(', '),
              full: plz ? `${city} (${plz})` : city,
            };
          });
        }
      }
    } catch (e) {
      console.warn('Photon API fetch fallback:', e);
    }

    // 2. Check local top German cities dataset for immediate instant matches (prefix matches prioritized)
    const localMatches = TOP_GERMAN_CITIES.filter(
      (c) =>
        c.city.toLowerCase().startsWith(cleanQ) ||
        c.plz.startsWith(cleanQ) ||
        c.city.toLowerCase().includes(cleanQ)
    ).map((c) => ({
      city: c.city,
      plz: c.plz,
      state: c.state,
      primary: c.plz ? `${c.city} (${c.plz})` : c.city,
      secondary: `${c.state}, Deutschland`,
      full: c.plz ? `${c.city} (${c.plz})` : c.city,
    }));

    // Deduplicate results based on city and plz
    const combined = [...localMatches, ...remoteMatches];
    const seen = new Set<string>();
    const deduplicated = [];

    for (const item of combined) {
      const key = `${item.city.toLowerCase()}_${item.plz}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
      if (deduplicated.length >= 6) break;
    }

    return NextResponse.json({ results: deduplicated });
  } catch (error) {
    console.error('Error in location autocomplete API:', error);
    return NextResponse.json({ results: [] });
  }
}
