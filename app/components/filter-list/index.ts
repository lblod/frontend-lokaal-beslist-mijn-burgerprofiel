import Component from '@glimmer/component';

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
import type { DistanceOption } from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';
import type { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import { formatNumber } from 'frontend-burgernabije-besluitendatabank/helpers/format-number';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type {
  AgendaItemsParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type FilterEditRoute from 'frontend-burgernabije-besluitendatabank/routes/filters/edit';

export interface Filter {
  name: string;
  filters: AgendaItemsParams;
  notify: boolean;
  selected: boolean;
  savedAt: string;
  resultCount: number;
}
interface FilterListArgs {
  model: ModelFrom<FilterEditRoute>;
  edit?: boolean;
}

export default class FilterList extends Component<FilterListArgs> {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;
  @service('item-list') declare itemsService: ItemListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare address: AddressService;
  @service declare mbpEmbed: MbpEmbedService;
  @tracked dateRangeHasErrors = false;
  @tracked isSavingFilters = false;
  @tracked filterName = '';
  @tracked errorMessage = '';

  constructor(owner: unknown, args: FilterListArgs) {
    super(owner, args);
    this.filterService.loadLocalStorageFilters();
    this.filterName = this.args.model?.localStorageFilter?.name ?? '';
  }

  get model() {
    return this.args.model;
  }
  get selectedBestuursorgaanIds() {
    return this.governingBodyList.options
      .filter(
        (o) =>
          this.filterService.filters.governingBodyClassificationIds.filter(
            (id) => new RegExp('\\b' + id + '\\b').test(o.id),
          ).length >= 1,
      )
      .map((o) => o.id);
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
  updateSelectedThemes(selected: Array<{ label: string; id: string }>) {
    this.filterService.updateFilters({
      themeIds: selected.map((theme) => theme.id),
    });
    this.filterService.setAllFiltersUnselected();
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  get status() {
    return this.filterService.filters.status;
  }

  @action
  setStatus(value: string) {
    this.filterService.updateFilters({ status: value });
    this.filterService.setAllFiltersUnselected();
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  @action
  updateSelectedGoverningBodyClassifications(selected: Array<string>) {
    const selectedIds: Array<string> = [];
    selected
      .map((idsString) => {
        selectedIds.push(...deserializeArray(idsString, ','));
      })
      .flat();
    this.filterService.updateFilters({
      governingBodyClassificationIds: selectedIds,
    });
    this.filterService.setAllFiltersUnselected();
    this.itemsService.fetchItems.perform(0, { size: 1 });
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
    this.filterService.setAllFiltersUnselected();
    this.itemsService.fetchItems.perform(0, { size: 1 });
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
    this.filterService.setAllFiltersUnselected();
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  @action
  updateSorting(event: { target: { value: SortType } }) {
    this.filterService.setAllFiltersUnselected();
    this.filterService.updateFilters({ dateSort: event?.target.value });
  }

  @action
  updateKeyword(keyword: string | null, onlyOnTitle: boolean) {
    this.filterService.updateFilters({
      keyword,
    });
    this.filterService.searchOnTitleOnly(onlyOnTitle);
    this.filterService.setAllFiltersUnselected();
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  @action
  updateDistance(selectedDistance: DistanceOption) {
    this.distanceList.selected = selectedDistance;
    this.filterService.updateFilters({
      distance: selectedDistance?.id,
    });
    this.filterService.setAllFiltersUnselected();
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  @action
  goToOverview() {
    let routeName = 'agenda-items.index';
    if (this.model.previousRoute) {
      routeName = this.model.previousRoute.name;
    }
    this.router.transitionTo(routeName, {
      queryParams: this.filterService.asQueryParams,
    });
  }

  @action
  goToLocalStorageFilters() {
    this.router.transitionTo('filters.show', {
      queryParams: this.filterService.asQueryParams,
    });
  }

  @action
  closeFilters() {
    let routeName = 'agenda-items.index';
    if (this.model.previousRoute) {
      routeName = this.model.previousRoute.name;
    }
    this.router.transitionTo(routeName, {
      queryParams: this.model.initialQueryParams,
    });
  }

  @action
  async saveFilters() {
    if (this.filterName.trim() === '') {
      return (this.errorMessage = 'De filternaam mag niet leeg zijn.');
    }
    const saved = this.filterService.localStorageFilters;
    const duplicate = saved.some(
      (f: { name: string }) =>
        f.name.toLowerCase() === this.filterName.toLowerCase(),
    );
    if (duplicate) {
      return (this.errorMessage = `Een filter met de naam "${this.filterName}" bestaat al.`);
    }
    this.isSavingFilters = true;
    const filters = this.filterService.filters;

    const newFilter = {
      name: this.filterName,
      filters,
      notify: true,
      selected: true,
      savedAt: new Date().toISOString(),
      resultCount: this.itemsService.totalItemCount || 0,
    };
    const updatedLocalStorageFilters = [...saved, newFilter];

    this.filterService.setAllFiltersUnselected();
    this.filterService.updateLocalStorageFilters(updatedLocalStorageFilters);

    try {
      await this.saveFilterToBackend(newFilter);
    } catch (err) {
      console.error(err);
      this.errorMessage =
        'Er is een fout opgetreden bij het opslaan van het filter.';
    } finally {
      this.filterName = '';
      this.isSavingFilters = false;
      this.goToOverview();
    }
  }

  async saveFilterToBackend(filter: Filter) {
    const deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found in localStorage.');
    }

    const payload = {
      deviceId,
      filter,
    };

    const response = await fetch(
      'http://lokaal-beslist.andres-dev.s.redhost.be:8888/register-filter',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save filter: ${errorText}`);
    }

    console.log('Filter successfully saved on backend.');
  }

  @action
  editFilter(filter: Filter) {
    const name = this.filterName?.trim() || filter.name;
    if (name === '') {
      return (this.errorMessage = 'De filternaam mag niet leeg zijn.');
    }

    const saved = this.filterService.localStorageFilters;

    const duplicate = saved.some(
      (f) =>
        f.name.toLowerCase() === name.toLowerCase() &&
        f.name.toLowerCase() !== filter.name.toLowerCase(),
    );

    if (duplicate) {
      return (this.errorMessage = `Een filter met de naam "${name}" bestaat al.`);
    }

    this.isSavingFilters = true;

    const updatedFilter: Filter = {
      ...filter,
      name,
      filters: this.filterService.filters,
      savedAt: new Date().toISOString(),
      resultCount: this.itemsService.totalItemCount || 0,
    };

    const updatedLocalStorageFilters = saved.map((f) =>
      f.name === filter.name ? updatedFilter : f,
    );

    this.filterService.updateLocalStorageFilters(updatedLocalStorageFilters);
    this.filterService.selectedLocalStorageFilter = updatedFilter;

    this.filterName = '';
    this.isSavingFilters = false;

    this.goToOverview();
  }

  @action
  updateFilterName(event: InputEvent) {
    this.filterName = (event.target as HTMLInputElement).value;
  }
}
