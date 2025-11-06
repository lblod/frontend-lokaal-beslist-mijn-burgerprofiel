import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type {
  AgendaItemsParams,
  SelectOption,
  SortType,
} from './agenda-items/types';

import type RouterService from '@ember/routing/router-service';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type { DistanceOption } from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';
import type FilterRoute from 'frontend-burgernabije-besluitendatabank/routes/filter';
import type { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import { formatNumber } from 'frontend-burgernabije-besluitendatabank/helpers/format-number';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

interface ToasterService {
  success(message: string, title: string, options?: ToastOptions): void;
  error(message: string, title: string, options?: ToastOptions): void;
}
interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  timeOut?: number;
  closable?: boolean;
}

interface Filter {
  name: string;
  filters: AgendaItemsParams;
  notify: boolean;
  savedAt: string;
  resultCount: number;
}

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
  @service declare toaster: ToasterService;

  declare model: ModelFrom<FilterRoute>;

  @tracked dateRangeHasErrors = false;
  @tracked showSaveFilterModal = false;
  @tracked showFiltersModal = false;
  @tracked isSavingFilters = false;
  @tracked filterName = '';
  @tracked savedFilters: Filter[] = [];

  constructor(...args: []) {
    super(...args);
    this.loadSavedFilters();
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
  updateSelectedThemes(selected: Array<SelectOption>) {
    this.filterService.updateFilters({
      themeIds: selected.map((theme) => theme.id),
    });
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  get status() {
    return this.filterService.filters.status;
  }

  @action
  setStatus(value: string) {
    this.filterService.updateFilters({ status: value });
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
    this.itemsService.fetchItems.perform(0, { size: 1 });
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
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  @action
  updateDistance(selectedDistance: DistanceOption) {
    this.distanceList.selected = selectedDistance;
    this.filterService.updateFilters({
      distance: selectedDistance?.id,
    });
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
  async resetFilters() {
    this.address.selectedAddress = undefined;
    this.distanceList.selected = null;
    this.governmentList.selected = [];
    this.filterService.resetFiltersToInitialView();
    this.filterService.resetDateRange();
    await this.governingBodyList.loadOptions();
    this.itemsService.fetchItems.perform(0, { size: 1 });
  }

  @action
  toggleSaveFilterModal() {
    this.showSaveFilterModal = !this.showSaveFilterModal;
  }

  @action
  toggleShowFilterModal() {
    this.showFiltersModal = !this.showFiltersModal;
  }

  @action
  toggleNotification(index: number) {
    this.savedFilters = this.savedFilters.map((filter, i) => {
      if (i !== index) return filter;

      const updatedFilter = { ...filter, notify: !filter.notify };

      this.toaster.success(
        `"${updatedFilter.name}" filter notificatie ${
          updatedFilter.notify ? 'ingeschakeld' : 'uitgeschakeld'
        }`,
        '',
        { timeOut: 2000 },
      );

      return updatedFilter;
    });

    localStorage.setItem('savedFilters', JSON.stringify(this.savedFilters));
  }

  @action
  saveFilters() {
    if (this.filterName.trim() === '') {
      this.toaster.error('De filternaam mag niet leeg zijn.', '', {
        timeOut: 2000,
      });
      return;
    }
    const saved = JSON.parse(localStorage.getItem('savedFilters') || '[]');

    const duplicate = saved.some(
      (f: { name: string }) =>
        f.name.toLowerCase() === this.filterName.toLowerCase(),
    );
    if (duplicate) {
      this.toaster.error(
        `Een filter met de naam "${this.filterName}" bestaat al.`,
        '',
        {
          timeOut: 2000,
        },
      );
      return;
    }
    this.isSavingFilters = true;
    const filters = this.filterService.filters;
    const newFilter = {
      name: this.filterName,
      filters,
      notify: true,
      savedAt: new Date().toISOString(),
      resultCount: this.itemsService.totalItemCount || 0,
    };

    const updatedSavedFilters = [...saved, newFilter];

    localStorage.setItem('savedFilters', JSON.stringify(updatedSavedFilters));
    this.savedFilters = updatedSavedFilters;
    this.toaster.success(`"${this.filterName}" filter opgeslagen`, '', {
      timeOut: 2000,
    });
    this.filterName = '';
    this.showSaveFilterModal = false;
    this.isSavingFilters = false;
  }

  @action
  updateFilterName(event: InputEvent) {
    this.filterName = (event.target as HTMLInputElement).value;
  }

  @action
  loadSavedFilters() {
    this.savedFilters = JSON.parse(
      localStorage.getItem('savedFilters') || '[]',
    );
    return this.savedFilters;
  }

  @action
  async loadFilter(savedFilter: Filter) {
    this.resetFilters();
    if (savedFilter.filters.street) {
      const address = await this.address.getSelectedAddress.perform(
        savedFilter.filters.street,
      );
      if (address) this.address.setSelectedAddress(address);
    }
    this.filterService.setFilters(savedFilter.filters);
    this.governmentList.loadSelectedGoverningBodiesByLabels();
    this.distanceList.selected = this.distanceList.getSelectedDistance(
      savedFilter.filters.distance,
    );
    this.filterService.loadDateRange(
      savedFilter.filters.plannedStartMin || '',
      savedFilter.filters.plannedStartMax || '',
    );
    this.filterName = '';
    this.showFiltersModal = false;
    this.toaster.success(`"${savedFilter?.name}" filter geladen`, '', {
      timeOut: 2000,
    });
  }

  @action
  deleteFilter(index: number) {
    const savedFilter = this.savedFilters[index];

    const confirmed = window.confirm(
      `Weet je zeker dat je "${savedFilter?.name}" filter wilt verwijderen?`,
    );

    if (!confirmed) {
      return;
    }
    this.savedFilters = this.savedFilters.filter((_, i) => i !== index);
    localStorage.setItem('savedFilters', JSON.stringify(this.savedFilters));
    this.toaster.success(`"${savedFilter?.name}" filter verwijderd`, '', {
      timeOut: 2000,
    });
  }
}
