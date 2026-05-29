import { lambert72ToWgs84, parseWktPoint, type LatLon } from './lambert72';

const LAMBERT_72_SRID = 31370;

/**
 * Convert a WKT point to WGS84 lat/lon. Only Lambert 72 (EPSG:31370) and WGS84
 * (EPSG:4326) are supported; anything else returns null.
 */
export function wgs84FromWkt(wkt: string | undefined | null): LatLon | null {
  const point = parseWktPoint(wkt);
  if (!point) {
    return null;
  }
  if (point.srid === undefined || point.srid === LAMBERT_72_SRID) {
    return lambert72ToWgs84(point.x, point.y);
  }
  if (point.srid === 4326) {
    // WGS84 WKT is stored as POINT(lon lat).
    return { lat: point.y, lon: point.x };
  }
  return null;
}

/**
 * Build an OpenStreetMap URL centred on a WKT point, or null if the point is
 * not in a supported coordinate system (so callers can fall back).
 */
export function osmUrlFromWkt(wkt: string | undefined | null): string | null {
  const latLon = wgs84FromWkt(wkt);
  if (!latLon) {
    return null;
  }
  const la = latLon.lat.toFixed(6);
  const lo = latLon.lon.toFixed(6);
  return `https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=18/${la}/${lo}`;
}

/** Human-readable "lat, lon" label, e.g. "51.04126, 3.72899". */
export function formatLatLon({ lat, lon }: LatLon): string {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

/** Build an OpenStreetMap search URL for a free-text label. */
export function osmUrlFromLabel(label: string | undefined | null): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    label ?? '',
  )}`;
}
