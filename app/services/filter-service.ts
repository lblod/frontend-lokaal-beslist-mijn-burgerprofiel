import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';

import type {
  AgendaItemsParams,
  FiltersAsQueryParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type MbpEmbedService from './mbp-embed';

import { keywordSearch } from 'frontend-burgernabije-besluitendatabank/helpers/keyword-search';
import {
  deserializeArray,
  serializeArray,
} from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export default class FilterService extends Service {
  @service declare router: RouterService;
  @service declare mbpEmbed: MbpEmbedService;

  @tracked keywordAdvancedSearch: { [key: string]: string[] } | null = null;
  @tracked filters: AgendaItemsParams = {
    keyword: null,
    keywordSearchOnlyInTitle: null,
    municipalityLabels: [],
    provinceLabels: [],
    plannedStartMin: null,
    plannedStartMax: null,
    dateSort: 'desc' as SortType,
    governingBodyClassificationIds: [],
    dataQualityList: [],
    status: '',
    themeIds: [],
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

  searchOnTitleOnly(searchOnTitleOnly: boolean) {
    this.filters.keywordSearchOnlyInTitle = `${searchOnTitleOnly}`;
    if (this.filters.keyword) {
      this.keywordAdvancedSearch = keywordSearch([
        this.filters.keyword,
        ['title'],
      ]);
    }
  }

  updateFiltersFromParams(params: Partial<AgendaItemsParams>) {
    // Mismatch in type as these are + separated strings here and not an array of string
    const bestuursorgaanIdsAsString =
      params.governingBodyClassificationIds as unknown as string;
    const themeIdsAsString = params.themeIds as unknown as string;
    const municipalityLabelsAsString =
      params.municipalityLabels as unknown as string;
    const provinceLabelsAsString = params.provinceLabels as unknown as string;
    delete params.governingBodyClassificationIds;
    delete params.governingBodyClassificationIds;
    delete params.municipalityLabels;
    delete params.provinceLabels;
    this.updateFilters({
      ...params,
      governingBodyClassificationIds: deserializeArray(
        bestuursorgaanIdsAsString,
      ),
      themeIds: deserializeArray(themeIdsAsString),
      municipalityLabels: deserializeArray(municipalityLabelsAsString),
      provinceLabels: deserializeArray(provinceLabelsAsString),
    });
  }

  resetFiltersToInitialView() {
    this.updateFilters({
      keyword: null,
      keywordSearchOnlyInTitle: null,
      provinceLabels: [],
      plannedStartMin: null,
      plannedStartMax: null,
      dateSort: 'desc' as SortType,
      governingBodyClassificationIds: [],
      dataQualityList: null,
      status: 'Alles',
      themeIds: [],
      street: null,
      distance: null,
    });

    if (this.mbpEmbed.isLoggedInAsVlaanderen) {
      this.updateFilters({
        municipalityLabels: [],
      });
    }
  }

  updateFilterFromQueryParamKey(
    key: keyof FiltersAsQueryParams,
    value: string | string[] | null,
  ) {
    const filterKey = this.getFilterKeyForQueryParamKey(key);
    if (!filterKey) {
      return null;
    }

    this.filters[filterKey] = value as string & string[] & null;
  }

  getFilterKeyForQueryParamKey(
    key: keyof FiltersAsQueryParams,
  ): keyof AgendaItemsParams | null {
    // TODO: combine QueryParameterKeys with these, QueryParameterKeys are the starting point
    const mapping = {
      gemeentes: 'municipalityLabels',
      provincies: 'provinceLabels',
      bestuursorganen: 'governingBodyClassifications',
      begin: 'plannedStartMin',
      eind: 'plannedStartMax',
      trefwoord: 'keyword',
      zoekOpTitel: 'keywordSearchOnlyInTitle',
      datumsortering: 'dateSort',
      status: 'status',
      thema: 'themeIds',
      straat: 'street',
      afstand: 'distance',
    };

    if (!Object.keys(mapping).includes(key)) {
      return null;
    }

    return mapping[key] as keyof AgendaItemsParams;
  }

  get hasActiveUserFilters() {
    const withoutMunicipality = { ...this.asQueryParams };
    delete withoutMunicipality.gemeentes;

    return !Object.values(withoutMunicipality).every((param) => !param);
  }

  get asQueryParams() {
    let governingBodyClassificationIds = null;
    let themeIds = null;
    let municipalityLabels = null;
    let provinceLabels = null;

    if (this.filters.governingBodyClassificationIds?.length >= 1) {
      governingBodyClassificationIds = serializeArray(
        this.filters.governingBodyClassificationIds,
      );
    }
    if (this.filters.themeIds?.length >= 1) {
      themeIds = serializeArray(this.filters.themeIds);
    }
    if (this.filters.municipalityLabels?.length >= 1) {
      municipalityLabels = serializeArray(this.filters.municipalityLabels);
    }
    if (this.filters.municipalityLabels?.length >= 1) {
      provinceLabels = serializeArray(this.filters.provinceLabels);
    }
    const queryParams: FiltersAsQueryParams = {
      gemeentes: municipalityLabels,
      provincies: provinceLabels,
      bestuursorganen: governingBodyClassificationIds,
      begin: this.filters.plannedStartMin,
      eind: this.filters.plannedStartMax,
      trefwoord: this.filters.keyword,
      zoekOpTitel: this.filters.keywordSearchOnlyInTitle,
      datumsortering: this.filters.dateSort as SortType,
      status: this.filters.status !== '' ? this.filters.status : undefined,
      thema: themeIds,
      straat: this.filters.street,
      afstand: this.filters.distance ?? null,
    };

    if (queryParams.status == 'Alles') {
      queryParams.status = undefined;
    }
    if (queryParams.datumsortering == 'desc') {
      queryParams.datumsortering = undefined;
    }
    if (queryParams.bestuursorganen === '') {
      queryParams.bestuursorganen = null;
    }
    if (queryParams.thema === '') {
      queryParams.thema = null;
    }
    if (queryParams.zoekOpTitel == 'false') {
      queryParams.zoekOpTitel = null;
    }
    return queryParams;
  }

  get resetQueryParams() {
    const params = {
      gemeentes: this.mbpEmbed.municipalityLabel,
      provincies: null,
      bestuursorganen: null,
      begin: null,
      eind: null,
      trefwoord: null,
      zoekOpTitel: null,
      datumsortering: null,
      status: null,
      thema: null,
      straat: null,
      afstand: null,
    };

    return params;
  }
}
