import Controller from '@ember/controller';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';

import type { SelectOption, SortType } from './agenda-items/types';
import type { DistanceOption } from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';
import type FilterRoute from 'frontend-burgernabije-besluitendatabank/routes/filter';
import type { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type NativeArray from '@ember/array/-private/native-array';

import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import { formatNumber } from 'frontend-burgernabije-besluitendatabank/helpers/format-number';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export default class FilterController extends Controller {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;
  @service('item-list') declare itemsService: ItemListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare address: AddressService;
  @service declare mbpEmbed: MbpEmbedService;

  declare model: ModelFrom<FilterRoute>;

  @tracked dateRangeHasErrors = false;
  @tracked bestuursorgaanOptions: NativeArray<GoverningBodyOption> = A([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(args: { Args: any }) {
    super(args);
    this.setBestuursorgaanOptions();
  }

  get selectedBestuursorgaanIds() {
    return this.filterService.filters.governingBodyClassificationIds;
  }

  get themaOptions() {
    return this.themeList.asOptions;
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
    return this.itemsService.totalItemCount || 0;
  }

  get isApplyingFilters() {
    return this.itemsService.fetchItems.isRunning;
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

  get isMunicipalitySelectorShown() {
    return this.mbpEmbed.isLoggedInAsVlaanderen;
  }

  @action
  updateSelectedThemes(selected: Array<SelectOption>) {
    this.filterService.updateFilters({
      themeIds: selected.map((theme) => theme.id),
    });
    this.itemsService.fetchItems.perform(0, false);
  }

  get status() {
    return this.filterService.filters.status;
  }

  @action
  setStatus(value: string) {
    this.filterService.updateFilters({ status: value });
    this.itemsService.fetchItems.perform(0, false);
  }

  @action
  updateSelectedGoverningBodyClassifications(selectedIds: Array<string>) {
    this.governingBodyList.selectedIds = selectedIds;
    this.filterService.updateFilters({
      governingBodyClassificationIds: selectedIds,
    });
    this.itemsService.fetchItems.perform(0, false);
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
      .map((o) => o.label);
    const provinceLabels = newOptions
      .filter((o) => o.type === LocalGovernmentType.Province)
      .map((o) => o.label);
    this.filterService.updateFilters({
      municipalityLabels,
      provinceLabels,
      governingBodyClassificationIds: [],
    });

    await this.governingBodyList.loadOptions();
    await this.setBestuursorgaanOptions();
    this.itemsService.fetchItems.perform(0, false);
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
    this.itemsService.fetchItems.perform(0, false);
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
    this.itemsService.fetchItems.perform(0, false);
  }

  @action
  updateDistance(selectedDistance: DistanceOption) {
    this.distanceList.selected = selectedDistance;
    this.filterService.updateFilters({
      distance: selectedDistance?.id,
    });
    this.itemsService.fetchItems.perform(0, false);
  }

  async setBestuursorgaanOptions() {
    let options = [];
    if (this.mbpEmbed.municipalityLabel) {
      options = await this.governingBodyList.fetchBestuursorgaanOptions(
        this.mbpEmbed.municipalityLabel,
      );
    } else if (this.governmentList?.selected?.length === 0) {
      options = await this.governingBodyList.getAll();
    } else {
      options = await this.governingBodyList.fetchBestuursorgaanOptions(
        serializeArray(this.governmentList.selected.map((g) => g.label)),
      );
    }
    this.governingBodyList.options = options;
    this.bestuursorgaanOptions.clear();
    this.bestuursorgaanOptions.pushObjects(A(options));
  }

  @action
  goToAgendaItems() {
    let routeName = 'agenda-items.index';
    if (this.model.previousRoute) {
      routeName = this.model.previousRoute.name;
    }
    this.router.transitionTo(routeName, {
      queryParams: this.filterService.asQueryParams,
    });
  }

  @action
  closeFilters() {
    this.goToAgendaItems();
  }

  @action
  async resetFilters() {
    this.governingBodyList.selectedIds = [];
    this.address.selectedAddress = undefined;
    this.distanceList.selected = null;
    this.governmentList.selected = [];
    this.filterService.resetFiltersToInitialView();
    this.itemsService.fetchItems.perform(0, false);
  }
}
