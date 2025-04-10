import type { PageableRequest } from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type Session from 'frontend-burgernabije-besluitendatabank/models/mu-search/session';

export interface SessionsParams {
  municipalityLabels: string;
  provinceLabels: string;
  plannedStartMin: string;
  plannedStartMax: string;
  keyword: string;
  governingBodyClassifications: string;
  dataQualityList: Array<string>;
  dateSort: string;
  status: string;
}

export interface SessionsLoaderArgs {
  Named: {
    filters: SessionsParams;
  };
}

export type SessionsQueryArguments = {
  index: string;
  page: number;
  size?: number;
  keyword?: string;
  locationIds?: string;
  provinceIds?: string;
  plannedStartMin?: string;
  plannedStartMax?: string;
  dateSort?: string;
  governingBodyClassificationIds?: string;
  status: string;
};

export type SessionMuSearchEntry = {
  uuid: string[] | string;
  abstract_location_id?: string;
  location_id?: string;
  abstract_governing_body_location_name?: string;
  governing_body_location_name?: string;
  abstract_governing_body_name?: string;
  governing_body_name?: string;
  abstract_governing_body_classification_name?: string;
  governing_body_classification_name?: string;
  planned_start?: string;
  started_at?: string;
  ended_at?: string;
  title?: string;
  description?: string;
  resolution_title?: string;
  'agenda-items_id'?: string[];
};

export type SessionsQueryResult = PageableRequest<
  SessionMuSearchEntry,
  Session
>;

export type SortType = 'asc' | 'desc';
