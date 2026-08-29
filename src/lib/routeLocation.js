function normalizeLabel(value) {
  return String(value || '').trim().toLowerCase();
}

function extractAirportCode(label) {
  const match = String(label || '').match(/\(([A-Z]{3})\)/);
  return match ? match[1] : null;
}

export function findLocationByLabel(label, airports = [], destinations = []) {
  if (!label) return null;

  const normalized = normalizeLabel(label);
  const code = extractAirportCode(label);
  const all = [...airports, ...destinations];

  if (code) {
    const byCode = airports.find((item) => item.code === code);
    if (byCode) return byCode;
  }

  const exact = all.find((item) => normalizeLabel(item.name) === normalized);
  if (exact) return exact;

  const partial = all.find((item) => {
    const itemName = normalizeLabel(item.name);
    const shortName = itemName.split('(')[0].trim();
    const routeShort = normalized.split('(')[0].trim();
    return itemName.includes(normalized)
      || normalized.includes(shortName)
      || routeShort.includes(shortName)
      || shortName.includes(routeShort);
  });
  if (partial) return partial;

  return {
    id: `route_loc_${normalized.replace(/[^a-z0-9]+/g, '_')}`,
    name: String(label).trim(),
    city: '',
    coords: null,
    type: 'route'
  };
}

export function matchesLocation(routeLabel, location) {
  if (!routeLabel || !location?.name) return false;
  const routeNorm = normalizeLabel(routeLabel);
  const locNorm = normalizeLabel(location.name);
  const routeCode = extractAirportCode(routeLabel);
  const locCode = location.code || extractAirportCode(location.name);

  if (routeCode && locCode && routeCode === locCode) return true;
  if (routeNorm === locNorm) return true;

  const routeShort = routeNorm.split('(')[0].trim();
  const locShort = locNorm.split('(')[0].trim();
  return routeShort.includes(locShort) || locShort.includes(routeShort);
}

export function buildRoutePickupOptions(routes = [], airports = []) {
  const known = new Set(airports.map((item) => normalizeLabel(item.name)));
  const extras = [];

  routes.forEach((route) => {
    const name = route.from;
    const key = normalizeLabel(name);
    if (!name || known.has(key) || extras.some((item) => normalizeLabel(item.name) === key)) return;
    known.add(key);
    extras.push({
      id: `route_pickup_${route.id}`,
      name,
      city: '',
      terminal: 'Popüler rota',
      type: 'route',
      coords: null
    });
  });

  return [...airports, ...extras];
}

export function buildRouteDestinationOptions(routes = [], destinations = []) {
  const known = new Set(destinations.map((item) => normalizeLabel(item.name)));
  const extras = [];

  routes.forEach((route) => {
    const name = route.to;
    const key = normalizeLabel(name);
    if (!name || known.has(key) || extras.some((item) => normalizeLabel(item.name) === key)) return;
    known.add(key);
    extras.push({
      id: `route_dest_${route.id}`,
      name,
      city: '',
      district: 'Popüler rota',
      type: 'route',
      coords: null
    });
  });

  return [...destinations, ...extras];
}

export function formatRouteChipLabel(route) {
  const from = String(route.from || '').split('(')[0].trim();
  const to = String(route.to || '').split('&')[0].trim();
  return `${from} ➔ ${to}`;
}
