import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import type {
  AgendaItemsQueryArguments,
  AgendaItemsQueryResult,
  AgendaItemMuSearchEntry,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type {
  DataMapper,
  MuSearchData,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';
import {
  parseMuSearchAttributeToArray,
  parseMuSearchAttributeToDate,
  parseMuSearchAttributeToString,
} from 'frontend-burgernabije-besluitendatabank/utils/mu-search-data-format';
import { keywordSearch } from 'frontend-burgernabije-besluitendatabank/helpers/keyword-search';

export function createAgendaItemsQuery({
  index,
  page,
  locationIds,
  themeIds,
  governingBodyClassificationIds,
  address,
  filters,
  size = 15,
}: AgendaItemsQueryArguments): AgendaItemsQueryResult {
  return {
    index,
    page,
    size,
    sort: `${filters.dateSort === 'asc' ? '+' : '-'}session_planned_start`,
    filters: buildFilters({
      locationIds,
      governingBodyClassificationIds,
      themeIds,
      address,
      filters,
    }),
    dataMapping,
  };
}

function buildFilters({
  locationIds,
  governingBodyClassificationIds,
  themeIds,
  address,
  filters,
}: Partial<AgendaItemsQueryArguments>): Record<string, string> {
  const query: Record<string, string> = {
    ':has:search_location_id': 't', // Ensure search_location_id is always present
  };

  if (filters?.plannedStartMin) {
    query[':query:session_planned_start'] =
      `session_planned_start:[${filters?.plannedStartMin} TO ${filters?.plannedStartMax || '*'}]`;
  }
  if (locationIds) {
    query[':terms:search_location_id'] = locationIds;
  }
  if (themeIds) {
    query[':query:themas.uuid'] = themeIds
      .split('+')
      .map((id) => `"${id}"`)
      .join(' OR ');
  }
  if (filters?.distance || address) {
    query[':geo:address_geometry_coord'] =
      `${address?.location.lat}, ${address?.location.lon},${filters?.distance ?? 100}km`;
  }
  if (governingBodyClassificationIds) {
    query[':terms:search_governing_body_classification_id'] =
      governingBodyClassificationIds;
  }

  if (filters?.keyword) {
    if (
      filters?.keyword === '-title*' ||
      filters?.keyword === '-description*'
    ) {
      if (filters?.keyword.includes('title')) {
        query[':has-no:title'] = 't';
      } else if (filters?.keyword.includes('description')) {
        query[':has-no:description'] = 't';
      }
    } else {
      const parsedResults = keywordSearch([
        filters?.keyword,
        ['title', 'description'],
      ]);
      const buildQuery = [];
      if (parsedResults !== null) {
        if (parsedResults['must'] && parsedResults['must'].length > 0) {
          buildQuery.push(`(${parsedResults['must'].join(' AND ')})`);
        }
        if (parsedResults['or'] && parsedResults['or'].length > 0) {
          buildQuery.push(`(${parsedResults['or'].join(' OR ')})`);
        }
        if (parsedResults['not'] && parsedResults['not'].length > 0) {
          buildQuery.push(`(NOT ${parsedResults['not'].join(' AND NOT ')})`);
        }
      }
      if (buildQuery.length !== 0) {
        query[':query:search_content'] = buildQuery.join(' AND ');
      } else {
        query[':fuzzy:search_content'] = filters?.keyword;
      }
    }
  }

  if (filters?.status === 'Behandeld') {
    query[':has:session_started_at'] = 't';
  }
  if (filters?.status === 'Niet behandeld') {
    query[':has-no:session_started_at'] = 't';
  }

  return query;
}

const dataMapping: DataMapper<AgendaItemMuSearchEntry, AgendaItem> = (
  data: MuSearchData<AgendaItemMuSearchEntry>,
) => {
  const entry = data.attributes;
  const dataResponse = new AgendaItem();

  Object.assign(dataResponse, {
    id: Array.isArray(entry.uuid) ? entry.uuid[0] : entry.uuid,
    title: cleanString(parseMuSearchAttributeToString(entry.title)),
    resolutionTitle: cleanString(
      parseMuSearchAttributeToString(entry.resolution_title),
    ),
    description: cleanString(parseMuSearchAttributeToString(entry.description)),
    locationId: entry.location_id || entry.abstract_location_id,
    abstractGoverningBodyLocationName: parseMuSearchAttributeToString(
      entry.abstract_governing_body_location_name,
    ),
    governingBodyLocationName: parseMuSearchAttributeToString(
      entry.governing_body_location_name,
    ),
    abstractGoverningBodyId: parseMuSearchAttributeToArray(
      entry.abstract_governing_body_id,
    ),
    governingBodyId: parseMuSearchAttributeToArray(entry.governing_body_id),
    abstractGoverningBodyName: parseMuSearchAttributeToString(
      entry.abstract_governing_body_name,
    ),
    governingBodyName: parseMuSearchAttributeToString(
      entry.governing_body_name,
    ),
    abstractGoverningBodyClassificationName: parseMuSearchAttributeToString(
      entry.abstract_governing_body_classification_name,
    ),
    governingBodyClassificationName: parseMuSearchAttributeToString(
      entry.governing_body_classification_name,
    ),
    sessionPlannedStart: parseMuSearchAttributeToDate(
      entry.session_planned_start,
    ),
    sessionEndedAt: parseMuSearchAttributeToDate(entry.session_ended_at),
    sessionStartedAt: parseMuSearchAttributeToDate(entry.session_started_at),
  });

  return dataResponse;
};
