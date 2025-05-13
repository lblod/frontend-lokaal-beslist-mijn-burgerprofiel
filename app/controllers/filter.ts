import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';
import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type { SortType } from './agenda-items/types';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export default class FilterController extends Controller {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;

  @tracked selectedThemas: Array<string> = [];

  get showAdvancedFilters() {
    return this.filterService.filters.governingBodyClassifications;
  }

  get hasMunicipalityFilter() {
    return this.filterService.filters.municipalityLabels;
  }

  get isFilterAscending() {
    return this.filterService.filters.dateSort === 'asc';
  }

  get isFilterDescending() {
    return this.filterService.filters.dateSort === 'desc';
  }

  get resultCount() {
    return this.itemsService.totalAgendaItems || 0;
  }

  @action
  updateSelectedThemas(selected: { label: string }) {
    console.log({ selected });
    this.itemsService.loadAgendaItems.perform(0, false);
  }

  @action
  async updateSelectedGovernment(
    newOptions: Array<{
      label: string;
      id: string;
      type: LocalGovernmentType;
    }>,
  ) {
    this.governmentList.selected = newOptions;
    const municipalityLabels = newOptions
      .filter((o) => o.type === LocalGovernmentType.Municipality)
      .map((o) => o.label)
      .toString();
    const provinceLabels = newOptions
      .filter((o) => o.type === LocalGovernmentType.Province)
      .map((o) => o.label)
      .toString();
    this.filterService.updateFilters({
      municipalityLabels,
      provinceLabels,
    });
    this.itemsService.loadAgendaItems.perform(0, false);

    await this.governingBodyList.loadOptions();
  }
  get selectedMunicipality() {
    return this.filterService.filters.municipalityLabels;
  }

  get status() {
    return this.filterService.filters.status;
  }

  @action
  setStatus(value: string) {
    this.filterService.updateFilters({ status: value });
    this.itemsService.loadAgendaItems.perform(0, false);
  }

  @action
  updateSelectedGoverningBodyClassifications(
    newOptions: Array<{
      label: string;
      id: string;
      type: 'governing-body-classifications';
    }>,
  ) {
    this.governingBodyList.selected = newOptions;
    const labels = newOptions.map((o) => o.label);
    this.filterService.updateFilters({
      governingBodyClassifications: serializeArray(labels),
    });
    this.itemsService.loadAgendaItems.perform(0, false);
  }

  get startDate() {
    return this.filterService.filters.plannedStartMin;
  }

  get endDate() {
    return this.filterService.filters.plannedStartMax;
  }

  @action
  updateSelectedDateRange(start: string, end: string) {
    this.filterService.updateFilters({
      plannedStartMin: start,
      plannedStartMax: end,
    });
    this.itemsService.loadAgendaItems.perform(0, false);
  }

  @action
  updateSorting(event: { target: { value: SortType } }) {
    this.filterService.updateFilters({ dateSort: event?.target.value });
  }

  @action
  updateSorting(event: { target: { value: SortType } }) {
    this.filterService.updateFilters({ dateSort: event?.target.value });
  }

  @action
  goToAgendaItems() {
    this.router.transitionTo('agenda-items.index');
  }

  @action
  async resetFilters() {
    this.governingBodyList.selected = [];
    this.filterService.resetFiltersToInitialView();
    this.goToAgendaItems();
  }

  @action
  async resetFilters() {
    this.hackRefreshDateComponent = true;
    this.governingBodyList.selected = [];
    this.filterService.resetFiltersToInitialView();
    this.itemsService.loadAgendaItems.perform(0, false);
    await timeout(10);
    this.hackRefreshDateComponent = false;
  }
}
