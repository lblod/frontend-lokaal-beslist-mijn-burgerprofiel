import type {
  Address,
  RawAddressResult,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';

export async function createLocationQuery(
  fuzzyString: string,
): Promise<Address[]> {
  const results = await (
    await fetch(`/adresses-register/search?query=${fuzzyString}`)
  ).json();
  if (!results || !results.adressen || results.adressen.length === 0) {
    return [];
  }
  return results.adressen.map(function (result: RawAddressResult): Address {
    return {
      addressRegisterId: result.ID,
      street: result.Thoroughfarename,
      housenumber: result.Housenumber,
      zipCode: result.Zipcode,
      municipality: result.Municipality,
      fullAddress: result.FormattedAddress,
      country: result.Country,
      location: {
        lat: result.Location.Lat_WGS84,
        lon: result.Location.Lon_WGS84,
      },
    };
  });
}
