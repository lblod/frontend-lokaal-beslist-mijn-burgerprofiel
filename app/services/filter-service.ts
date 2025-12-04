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
import { action } from '@ember/object';
import type { Filter } from 'frontend-burgernabije-besluitendatabank/components/filter-list';
import type AddressService from './address';
import type DistanceListService from './distance-list';
import type ItemListService from './item-list';
import type GoverningBodyListService from './governing-body-list';
import type GovernmentListService from './government-list';
import type ThemeListService from './theme-list';

export default class FilterService extends Service {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;
  @service('item-list') declare itemsService: ItemListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare mbpEmbed: MbpEmbedService;
  @service declare address: AddressService;
  @tracked localStorageFilters: Filter[] = JSON.parse(
    localStorage.getItem('localStorageFilters') || '[]',
  );

  @tracked selectedLocalStorageFilter =
    this.localStorageFilters.find((f: Filter) => f.selected === true) || null;
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

  constructor() {
    super(...arguments);
    this.loadLocalStorageFilters();
  }

  @action
  setFilters(newFilters: Partial<AgendaItemsParams>) {
    this.filters = { ...this.filters, ...newFilters };
  }

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
    this.setFilters(newFilters);
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
        ',',
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
      dataQualityList: [],
      status: 'Alles',
      themeIds: [],
      street: null,
      distance: null,
      municipalityLabels: this.mbpEmbed.isLoggedInAsVlaanderen
        ? []
        : this.filters.municipalityLabels,
    });
  }
  resetDateRange!: () => void;
  loadDateRange!: (start: string, end: string) => void;
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
      bestuursorganen: 'governingBodyClassificationIds',
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
        ',',
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

  setAllFiltersUnselected(): Filter[] {
    this.selectedLocalStorageFilter = null;

    const unselectedFilters = JSON.parse(
      localStorage.getItem('localStorageFilters') || '[]',
    ).map((f: Filter) => ({ ...f, selected: false }));
    localStorage.setItem(
      'localStorageFilters',
      JSON.stringify(unselectedFilters),
    );
    return unselectedFilters;
  }

  @action
  selectFilter(name: string) {
    const newFilters = this.localStorageFilters.map((f) => ({
      ...f,
      selected: f.name === name,
    }));
    this.updateLocalStorageFilters(newFilters);
    this.selectedLocalStorageFilter =
      newFilters.find((f) => f.selected) || null;
  }

  @action
  loadLocalStorageFilters() {
    const stored = localStorage.getItem('localStorageFilters');
    this.localStorageFilters = stored ? JSON.parse(stored) : [];
    this.selectedLocalStorageFilter =
      this.localStorageFilters.find((f) => f.selected) || null;
  }

  @action
  deleteFilter(index: number) {
    const savedFilter = this.localStorageFilters[index];
    if (!savedFilter) return;

    const confirmed = window.confirm(
      `Weet je zeker dat je "${savedFilter.name}" filter wilt verwijderen?`,
    );
    if (!confirmed) return;

    const newFilters = this.localStorageFilters.filter((_, i) => i != index);
    console.log(newFilters);
    this.updateLocalStorageFilters(newFilters);

    if (savedFilter.selected) {
      this.selectedLocalStorageFilter = null;
    }

    this.router.transitionTo('filters.show', {
      queryParams: this.filterService.asQueryParams,
    });
  }

  @action
  async loadFilter(savedFilter: Filter) {
    if (!savedFilter) return;
    if (savedFilter && savedFilter.filters.street) {
      const address = await this.address.getSelectedAddress.perform(
        savedFilter.filters.street,
      );
      if (address) this.address.setSelectedAddress(address);
    }
    this.setFilters(savedFilter.filters);
    this.governmentList.loadSelectedGoverningBodiesByLabels();
    this.distanceList.selected = this.distanceList.getSelectedDistance(
      savedFilter.filters.distance,
    );
    // this.loadDateRange(
    //   savedFilter.filters.plannedStartMin || '',
    //   savedFilter.filters.plannedStartMax || '',
    // );
    this.selectFilter(savedFilter.name);

    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  @action
  async resetFilters() {
    this.address.selectedAddress = undefined;
    this.distanceList.selected = null;
    this.governmentList.selected = [];
    this.selectedLocalStorageFilter = null;
    this.setAllFiltersUnselected();
    this.resetFiltersToInitialView();
    this.resetDateRange();
    await this.governingBodyList.loadOptions();
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  updateLocalStorageFilters(newFilters: Filter[]) {
    this.localStorageFilters = newFilters;
    localStorage.setItem(
      'localStorageFilters',
      JSON.stringify(this.localStorageFilters),
    );
  }
}
