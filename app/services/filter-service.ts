import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type {
  AgendaItemsParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type ItemsService from './items-service';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { keywordSearch } from 'frontend-burgernabije-besluitendatabank/helpers/keyword-search';

export default class FilterService extends Service {
  @service declare router: RouterService;
  @service declare itemsService: ItemsService;
  @tracked keywordAdvancedSearch: { [key: string]: string[] } | null = null;
  @tracked filters: AgendaItemsParams = {
    keyword: '',
    municipalityLabels: '',
    provinceLabels: '',
    plannedStartMin: '',
    plannedStartMax: '',
    dateSort: 'desc' as SortType,
    governingBodyClassifications: '',
    dataQualityList: [],
    status: 'Alles',
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
  @action
  handleDateSortChange(event: { target: { value: SortType } }) {
    const queryParams = { [QueryParameterKeys.dateSort]: event?.target?.value };
    this.router.transitionTo({ queryParams });
    this.updateFilters({ dateSort: event?.target?.value });
  }
}
