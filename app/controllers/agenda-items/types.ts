import type { PageableRequest } from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import type { DistanceOption } from 'frontend-burgernabije-besluitendatabank/services/distance-list';

export interface AgendaItemsParams {
  keyword: string | null;
  keywordSearchOnlyInTitle: string | null;
  municipalityLabels: Array<string>;
  provinceLabels: Array<string>;
  plannedStartMin: string | null;
  plannedStartMax: string | null;
  governingBodyClassificationIds: Array<string>;
  dataQualityList: Array<string> | null;
  dateSort: string;
  status: string;
  themeIds: Array<string>;
  street: string | null;
  distance: string | DistanceOption | null;
}

export type FiltersAsQueryParams = {
  gemeentes?: string | null;
  provincies: string | null;
  bestuursorganen: string | null;
  begin: string | null;
  eind: string | null;
  trefwoord: string | null;
  zoekOpTitel: string | null;
  datumsortering?: SortType;
  status?: string;
  thema: string | null;
  straat: string | null;
  afstand: string | null;
};

export interface AgendaItemsLoaderArgs {
  Named: {
    filters: AgendaItemsParams;
  };
}

export type AgendaItemsQueryArguments = {
  index: string;
  page: number;
  size?: number;
  locationIds?: string;
  provinceIds?: string;
  themeIds: string | null;
  address?: Address | null;
  governingBodyClassificationIds: string | null;
  filters: AgendaItemsParams;
};

export type AgendaItemMuSearchEntry = {
  uuid: string[] | string;
  abstract_location_id?: string;
  location_id?: string;
  abstract_governing_body_location_name?: string;
  governing_body_location_name?: string;
  abstract_governing_body_id?: string;
  governing_body_id?: string;
  abstract_governing_body_name?: string;
  governing_body_name?: string;
  abstract_governing_body_classification_name?: string;
  governing_body_classification_name?: string;
  session_planned_start?: string;
  session_started_at?: string;
  session_ended_at?: string;
  title?: string;
  description?: string;
  resolution_title?: string;
};

export type AgendaItemsQueryResult = PageableRequest<
  AgendaItemMuSearchEntry,
  AgendaItem
>;
export type SortType = 'asc' | 'desc';

export type SelectOption = {
  id: string;
  label: string;
};

export interface Address {
  addressRegisterId: number;
  street: string;
  housenumber: string;
  zipCode: string;
  municipality: string;
  fullAddress: string;
  country: string;
  location: {
    lat: number;
    lon: number;
  };
}

type Coordinate = {
  Lat_WGS84: number;
  Lon_WGS84: number;
  X_Lambert72: number;
  Y_Lambert72: number;
  X_Lambert2008: number;
  Y_Lambert2008: number;
};

type BoundingBox = {
  LowerLeft: Coordinate;
  UpperRight: Coordinate;
};

export type RawAddressResult = {
  Municipality: string;
  Zipcode: string;
  Thoroughfarename: string;
  Housenumber: string;
  ID: number;
  FormattedAddress: string;
  Location: Coordinate;
  LocationType: string;
  BoundingBox: BoundingBox;
  Country: string;
};
