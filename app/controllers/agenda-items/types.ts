import type { PageableRequest } from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import type { DistanceOption } from 'frontend-burgernabije-besluitendatabank/services/distance-list';

export interface AgendaItemsParams {
  keyword: string | null;
  municipalityLabels: string | null;
  provinceLabels: string | null;
  plannedStartMin: string | null;
  plannedStartMax: string | null;
  governingBodyClassifications: string | null;
  dataQualityList: Array<string> | null;
  dateSort: string;
  status: string;
  themes: string;
  street: string;
  distance?: DistanceOption;
}

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
  themeIds?: string;
  governingBodyClassificationIds?: string;
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
