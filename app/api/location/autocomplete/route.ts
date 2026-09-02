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

    // Handle Reverse Geocoding (Meinen Standort verwenden)
    if (lat && lon) {
      try {
        const revRes = await fetch(
          `https://photon.komoot.io/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
          { headers, cache: 'no-store' }
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          const first = revData.features?.[0]?.properties;
          if (first) {
            const city = first.city || first.town || first.village || first.county || first.name || 'Mein Standort';
            const plz = first.postcode || '';
            const state = first.state || '';
            const full = plz ? `${city} (${plz})` : city;
            return NextResponse.json({
              success: true,
              result: {
                city,
                plz,
                state,
                primary: full,
                secondary: [state, 'Deutschland'].filter(Boolean).join(', '),
                full,
              },
            });
          }
        }
      } catch (e) {
        console.error('Error in reverse geocoding:', e);
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
