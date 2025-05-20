import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';

import type {
  AgendaItemsParams,
  FiltersAsQueryParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import { keywordSearch } from 'frontend-burgernabije-besluitendatabank/helpers/keyword-search';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export default class FilterService extends Service {
  @service declare router: RouterService;

  @tracked keywordAdvancedSearch: { [key: string]: string[] } | null = null;
  @tracked filters: AgendaItemsParams = {
    keyword: null,
    municipalityLabels: null,
    provinceLabels: null,
    plannedStartMin: null,
    plannedStartMax: null,
    dateSort: 'desc' as SortType,
    governingBodyClassificationIds: [],
    dataQualityList: [],
    status: '',
    themes: '',
    street: null,
    distance: null,
  };

  updateFilters(newFilters: Partial<AgendaItemsParams>) {
    if (newFilters.keyword && newFilters.keyword !== this.filters.keyword) {
      if (
        newFilters.keyword == '-title*' ||
        newFilters.keyword === '-description*'
      ) {
        this.keywordAdvancedSearch = null;
      } else {
        this.keywordAdvancedSearch = keywordSearch([newFilters.keyword]);
      }
    } else if (newFilters.keyword === '') {
      this.keywordAdvancedSearch = null;
    }
    this.filters = { ...this.filters, ...newFilters };
  }

  resetFiltersToInitialView() {
    this.updateFilters({
      keyword: null,
      municipalityLabels: 'Aalter',
      provinceLabels: null,
      plannedStartMin: null,
      plannedStartMax: null,
      dateSort: 'desc' as SortType,
      governingBodyClassificationIds: [],
      dataQualityList: null,
      status: 'Alles',
      themes: null,
      street: null,
      distance: null,
    });
  }

  updateFilterFromQueryParamKey(
    key: keyof FiltersAsQueryParams,
    value: string | string[] | null,
  ) {
    const filterKey = this.getFilterKeyForQueryParamKey(key);
    this.filters[filterKey] = value as string & string[] & null;
  }

  getFilterKeyForQueryParamKey(
    key: keyof FiltersAsQueryParams,
  ): keyof AgendaItemsParams {
    // TODO: combine QueryParameterKeys with these, QueryParameterKeys are the starting point
    const mapping = {
      gemeentes: 'municipalityLabels',
      provincies: 'provinceLabels',
      bestuursorganen: 'governingBodyClassifications',
      start: 'plannedStartMin',
      end: 'plannedStartMax',
      trefwoord: 'keyword',
      datumsortering: 'dateSort',
      status: 'status',
      thema: 'themes',
      straat: 'street',
      afstand: 'distance',
    };

    return mapping[key] as keyof AgendaItemsParams;
  }

  get hasActiveUserFilters() {
    return !Object.values(this.asQueryParams).every((param) => !param);
  }

  get asQueryParams() {
    let governingBodyClassificationIds = null;

    if (this.filters.governingBodyClassificationIds.length >= 1) {
      governingBodyClassificationIds = serializeArray(
        this.filters.governingBodyClassificationIds,
      );
    }

    const queryParams: FiltersAsQueryParams = {
      gemeentes: 'Aalter',
      provincies: this.filters.provinceLabels,
      bestuursorganen: governingBodyClassificationIds,
      start: this.filters.plannedStartMin,
      end: this.filters.plannedStartMax,
      trefwoord: this.filters.keyword,
      datumsortering: this.filters.dateSort as SortType,
      status: this.filters.status,
      thema: this.filters.themes,
      straat: null, // this.filters.street TODO: once backend is ok
      afstand: null, // this.filters.distance?.label || null TODO: once backend is ok
    };

    if (queryParams.status == 'Alles') {
      delete queryParams.status;
    }
    if (queryParams.datumsortering == 'desc') {
      delete queryParams.datumsortering;
    }
    return queryParams;
  }
}
