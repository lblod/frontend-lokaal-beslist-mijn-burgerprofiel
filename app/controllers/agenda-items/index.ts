import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import type { SortType } from './types';
import type RouterService from '@ember/routing/router-service';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from '../../services/items-service';

export default class AgendaItemsIndexController extends Controller {
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;
  @service declare router: RouterService;
  @tracked hasFilter = false;

  @tracked dateSort: SortType = 'desc';

  get filters() {
    console.log(this.filterService.filters);
    return this.filterService.filters;
  }

  get filterKeysToHide(): Array<string> {
    return ['isTrusted'];
  }

  @action
  resetFilters() {
    this.filterService.resetFiltersToInitialView();
    this.router.transitionTo(this.router.currentRouteName, {
      queryParams: {
        gemeentes: this.filterService.filters.municipalityLabels,
        provincies: this.filterService.filters.provinceLabels,
        bestuursorganen:
          this.filterService.filters.governingBodyClassifications,
        start: this.filterService.filters.plannedStartMin,
        end: this.filterService.filters.plannedStartMax,
        trefwoord: this.filterService.filters.keyword,
        datumsortering: this.filterService.filters.dateSort,
        status: this.filterService.filters.status,
      },
    });
  }

  @action
  goToFilters() {
    this.router.transitionTo('filter');
  }
}
