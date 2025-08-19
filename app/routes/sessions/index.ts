import Route from '@ember/routing/route';
import { service } from '@ember/service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import type { AgendaItemsParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';

export default class SessionsIndexRoute extends Route {
  @service declare features: FeaturesService;
  @service declare filterService: FilterService;
  @service('item-list') declare itemsService: ItemListService;

  queryParams = {
    municipalityLabels: {
      as: QueryParameterKeys.municipalities,
      refreshModel: true,
    },
    provinceLabels: {
      as: QueryParameterKeys.provinces,
      refreshModel: true,
    },
    governingBodyClassifications: {
      as: QueryParameterKeys.governingBodies,
      refreshModel: true,
    },
    plannedStartMin: {
      as: QueryParameterKeys.start,
      refreshModel: true,
    },
    plannedStartMax: {
      as: QueryParameterKeys.end,
      refreshModel: true,
    },
    keyword: {
      as: QueryParameterKeys.keyword,
      refreshModel: true,
    },
    dateSort: {
      as: QueryParameterKeys.dateSort,
      refreshModel: true,
    },
    status: {
      as: QueryParameterKeys.status,
      refreshModel: true,
    },
  };
  async model(params: AgendaItemsParams) {
    this.filterService.updateFiltersFromParams(params);
    this.itemsService.changeModelIndex('session');
    this.itemsService.loadFirstPage(this.filterService.filters);

    return { filters: this.filterService.asQueryParams };
  }
}
