import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';

import type { SelectOption, SortType } from './agenda-items/types';
import type { DistanceOption } from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import { formatNumber } from 'frontend-burgernabije-besluitendatabank/helpers/format-number';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';

export default class FilterController extends Controller {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare address: AddressService;

  @tracked dateRangeHasErrors = false;

  get selectedBestuursorgaanIds() {
    return this.filterService.filters.governingBodyClassificationIds;
  }

  get selectedThemes() {
    return this.themeList.getOptionsForIds(this.filterService.filters.themeIds);
  }

  get keywordValue() {
    return this.filterService.filters.keyword;
  }

  get hasSelectedAdvancedFilters() {
    return this.selectedBestuursorgaanIds.length >= 1;
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

  get isApplyingFilters() {
    return this.itemsService.loadAgendaItems.isRunning;
  }

  get filtersHaveErrors() {
    return this.dateRangeHasErrors;
  }

  get showResultsText() {
    if (this.resultCount === 0) {
      return 'Geen resultaten';
    }
    if (this.filterService.hasActiveUserFilters) {
      const countAsString = formatNumber([this.resultCount, 0]);

      return `Toon ${countAsString} resultaten`;
    }
    return 'Toon resultaten';
  }

  @action
  updateSelectedThemes(selected: Array<SelectOption>) {
    this.filterService.updateFilters({
      themeIds: selected.map((theme) => theme.id),
    });
    this.itemsService.loadAgendaItems.perform(0, false);
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
  updateSelectedGoverningBodyClassifications(selectedIds: Array<string>) {
    this.governingBodyList.selectedIds = selectedIds;
    this.filterService.updateFilters({
      governingBodyClassificationIds: selectedIds,
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
  updateSelectedDateRange(start: string, end: string, hasErrors = false) {
    this.dateRangeHasErrors = hasErrors;
    if (this.dateRangeHasErrors) {
      return;
    }
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
  updateKeyword(keyword: string | null, onlyOnTitle: boolean) {
    this.filterService.updateFilters({
      keyword,
    });
    this.filterService.searchOnTitleOnly(onlyOnTitle);
    this.itemsService.loadAgendaItems.perform(0, false);
  }

  @action
  updateDistance(selectedDistance: DistanceOption) {
    this.distanceList.selected = selectedDistance;
    this.filterService.updateFilters({
      distance: selectedDistance?.id,
    });
    this.itemsService.loadAgendaItems.perform(0, false);
  }

  @action
  goToAgendaItems() {
    this.router.transitionTo('agenda-items.index', {
      queryParams: this.filterService.asQueryParams,
    });
  }

  @action
  async resetFilters() {
    this.governingBodyList.selectedIds = [];
    this.address.selectedAddress = undefined;
    this.distanceList.selected = null;
    this.filterService.resetFiltersToInitialView();
    this.itemsService.loadAgendaItems.perform(0, false);
  }
}
