/**
 * Convert Belgian Lambert 72 (EPSG:31370) projected coordinates to WGS84
 * lat/lon, using the rigorous inverse Lambert Conformal Conic (2SP) formula
 * with the official EPSG:31370 parameters. The BD72 -> WGS84 datum shift is
 * sub-2m and omitted, which is well within tolerance for placing a map pin.
 */

const A = 6378388.0; // International 1924 ellipsoid semi-major axis
const FLATTENING = 1 / 297.0;
const E = Math.sqrt(2 * FLATTENING - FLATTENING * FLATTENING);
const D2R = Math.PI / 180;

const PHI1 = 51.1666672333 * D2R; // standard parallel 1
const PHI2 = 49.8333339 * D2R; // standard parallel 2
const PHIF = 90 * D2R; // latitude of false origin
const LAM0 = 4.3674866667 * D2R; // longitude of false origin
const EF = 150000.013; // easting at false origin
const NF = 5400088.438; // northing at false origin

const m = (phi: number) =>
  Math.cos(phi) / Math.sqrt(1 - E * E * Math.sin(phi) ** 2);
const t = (phi: number) =>
  Math.tan(Math.PI / 4 - phi / 2) /
  Math.pow((1 - E * Math.sin(phi)) / (1 + E * Math.sin(phi)), E / 2);

const N =
  (Math.log(m(PHI1)) - Math.log(m(PHI2))) /
  (Math.log(t(PHI1)) - Math.log(t(PHI2)));
const BIG_F = m(PHI1) / (N * Math.pow(t(PHI1), N));
const RHO_F = A * BIG_F * Math.pow(t(PHIF), N);

export interface LatLon {
  lat: number;
  lon: number;
}

export function lambert72ToWgs84(x: number, y: number): LatLon {
  const ep = x - EF;
  const np = y - NF;
  const rho = Math.sign(N) * Math.sqrt(ep * ep + (RHO_F - np) ** 2);
  const tp = Math.pow(rho / (A * BIG_F), 1 / N);
  const theta = Math.atan2(ep, RHO_F - np);
  const lon = theta / N + LAM0;

  let lat = Math.PI / 2 - 2 * Math.atan(tp);
  for (let i = 0; i < 15; i++) {
    lat =
      Math.PI / 2 -
      2 *
        Math.atan(
          tp *
            Math.pow((1 - E * Math.sin(lat)) / (1 + E * Math.sin(lat)), E / 2),
        );
  }

  return { lat: lat / D2R, lon: lon / D2R };
}

/**
 * Parse a WKT point literal such as
 * "SRID=31370;POINT(105218.36 192475.16)" into its x/y and SRID. Returns null
 * if it is not a parseable POINT.
 */
export function parseWktPoint(
  wkt: string | undefined | null,
): { x: number; y: number; srid?: number } | null {
  if (!wkt) {
    return null;
  }
  const sridMatch = /SRID=(\d+)/i.exec(wkt);
  const pointMatch =
    /POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i.exec(wkt);
  if (!pointMatch) {
    return null;
  }
  const x = Number(pointMatch[1]);
  const y = Number(pointMatch[2]);
  if (Number.isNaN(x) || Number.isNaN(y)) {
    return null;
  }
  return { x, y, srid: sridMatch ? Number(sridMatch[1]) : undefined };
}
