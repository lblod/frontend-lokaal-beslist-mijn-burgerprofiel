import type { PageableRequest } from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';

export interface AgendaItemsParams {
  keyword: string;
  municipalityLabels: string;
  provinceLabels: string;
  plannedStartMin: string;
  plannedStartMax: string;
  governingBodyClassifications: string;
  dataQualityList: Array<string>;
  dateSort: string;
  status: string;
  themes: string;
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
  keyword?: string;
  locationIds?: string;
  provinceIds?: string;
  themeIds?: string;
  plannedStartMin?: string;
  plannedStartMax?: string;
  dateSort?: string;
  governingBodyClassificationIds?: string;
  status: string;
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
