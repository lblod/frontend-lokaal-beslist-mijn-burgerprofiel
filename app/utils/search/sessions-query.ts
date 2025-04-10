import Session from 'frontend-burgernabije-besluitendatabank/models/mu-search/session';

import type {
  DataMapper,
  MuSearchData,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import {
  parseMuSearchAttributeToDate,
  parseMuSearchAttributeToString,
} from 'frontend-burgernabije-besluitendatabank/utils/mu-search-data-format';
import type {
  SessionMuSearchEntry,
  SessionsQueryArguments,
  SessionsQueryResult,
} from 'frontend-burgernabije-besluitendatabank/controllers/sessions/types';

export function createSessionsQuery({
  index,
  page,
  keyword,
  plannedStartMin,
  plannedStartMax,
  dateSort,
  locationIds,
  governingBodyClassificationIds,
  status,
  size = 15,
}: SessionsQueryArguments): SessionsQueryResult {
  return {
    index,
    page,
    size,
    sort: `${dateSort === 'asc' ? '+' : '-'}planned_start`,
    filters: buildFilters({
      keyword,
      locationIds,
      plannedStartMin,
      plannedStartMax,
      governingBodyClassificationIds,
      status,
    }),
    dataMapping,
  };
}

function buildFilters({
  keyword,
  locationIds,
  plannedStartMin,
  plannedStartMax,
  governingBodyClassificationIds,
  status,
}: Partial<SessionsQueryArguments>): Record<string, string> {
  const filters: Record<string, string> = {
    ':has:search_location_id': 't', // Ensure search_location_id is always present
  };

  if (plannedStartMin) {
    filters[':query:planned_start'] = `(planned_start:[${plannedStartMin} TO ${
      plannedStartMax || '*'
    }] ) `;
  }

  if (locationIds) {
    filters[':terms:search_location_id'] = locationIds;
  }
  if (governingBodyClassificationIds) {
    filters[':terms:search_governing_body_classification_id'] =
      governingBodyClassificationIds;
  }
  if (status === 'Behandeld') {
    filters[':has:ended_at'] = 't';
  }
  if (status === 'Niet behandeld') {
    filters[':has-no:ended_at'] = 't';
  }
  if (keyword) {
    filters[':fuzzy:search_content'] = keyword;
  }

  return filters;
}

const dataMapping: DataMapper<SessionMuSearchEntry, Session> = (
  data: MuSearchData<SessionMuSearchEntry>,
) => {
  const entry = data.attributes;

  return Object.assign(new Session(), {
    id: Array.isArray(entry.uuid) ? entry.uuid[0] : entry.uuid,
    locationId: entry.location_id || entry.abstract_location_id,
    abstractGoverningBodyLocationName: parseMuSearchAttributeToString(
      entry.abstract_governing_body_location_name,
    ),
    governingBodyLocationName: parseMuSearchAttributeToString(
      entry.governing_body_location_name,
    ),
    abstractGoverningBodyName: parseMuSearchAttributeToString(
      entry.abstract_governing_body_name,
    ),
    governingBodyName: parseMuSearchAttributeToString(
      entry.governing_body_name,
    ),
    agendaItemsId: entry['agenda-items_id'] ?? [],
    abstractGoverningBodyClassificationName: parseMuSearchAttributeToString(
      entry.abstract_governing_body_classification_name,
    ),
    governingBodyClassificationName: parseMuSearchAttributeToString(
      entry.governing_body_classification_name,
    ),
    plannedStart: parseMuSearchAttributeToDate(entry.planned_start),
    endedAt: parseMuSearchAttributeToDate(entry.ended_at),
    startedAt: parseMuSearchAttributeToDate(entry.started_at),
  });
};
