import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type ItemsService from './items-service';
import type RouterService from '@ember/routing/router-service';

import type {
  AgendaItemsParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import { keywordSearch } from 'frontend-burgernabije-besluitendatabank/helpers/keyword-search';

export default class FilterService extends Service {
  @service declare router: RouterService;
  @service declare itemsService: ItemsService;
  @tracked keywordAdvancedSearch: { [key: string]: string[] } | null = null;
  @tracked filters: AgendaItemsParams = {
    keyword: null,
    municipalityLabels: null,
    provinceLabels: null,
    plannedStartMin: null,
    plannedStartMax: null,
    dateSort: 'desc' as SortType,
    governingBodyClassifications: '',
    dataQualityList: [],
    status: '',
    themes: '',
    street: '',
    distance: undefined,
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
    this.filters = {
      keyword: null,
      municipalityLabels: 'Aalter',
      provinceLabels: null,
      plannedStartMin: null,
      plannedStartMax: null,
      dateSort: 'desc' as SortType,
      governingBodyClassifications: null,
      dataQualityList: null,
      status: 'Alles',
      themes: '',
      street: '',
      distance: undefined,
    };
  }
}
