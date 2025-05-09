import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type {
  AgendaItemsParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';
import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type { DistanceOption } from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { task, timeout } from 'ember-concurrency';

interface FilterSidebarWrapperArgs {
  filters: AgendaItemsParams;
  onFiltersChange: (filters: AgendaItemsParams) => void;
  dateSort: SortType;
  hasFilter: boolean;
}

const DEBOUNCE_DELAY = 500;

export default class FilterSidebarWrapper extends Component<FilterSidebarWrapperArgs> {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare themeList: ThemeListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;
  @service declare distanceList: DistanceListService;
  @service declare itemsService: ItemsService;

  get governigBodyOptions() {
    return this.governingBodyList.options;
  }
  get showAdvancedFilters() {
    return (
      this.filterService.filters.governingBodyClassifications &&
      this.filterService.filters.governingBodyClassifications.length > 0
    );
  }

  get statusOfAgendaItemsOptions() {
    return ['Behandeld', 'Niet behandeld'];
  }

  get hasMunicipalityFilter() {
    return this.args.filters.municipalityLabels.length > 0;
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
    const governingBodyClassifications = newOptions
      .map((o) => o.label)
      .toString();
    if (governingBodyClassifications != '') {
      this.filterService.updateFilters({
        governingBodyClassifications,
      });
    }
  }
  @action
  updateSelectedDateRange(start: string, end: string) {
    this.filterService.updateFilters({
      plannedStartMin: start,
      plannedStartMax: end,
    });
  }
  @action
  updateSelectedThemes(
    newOptions: Array<{
      label: string;
      id: string;
      type: 'concepts';
    }>,
  ) {
    this.themeList.selected = newOptions;
    this.filterService.updateFilters({
      themes: newOptions.map((o) => o.id).toString(),
    });
  }

  private updateStreetQueryParam(value: string | null) {
    const queryParams = {
      [QueryParameterKeys.street]: value,
    };

    this.router.transitionTo(this.router.currentRouteName, { queryParams });
  }

  updateStreetTask = task({ restartable: true }, async (value: string) => {
    await timeout(DEBOUNCE_DELAY);
    this.filterService.updateFilters({ street: value });
    this.updateStreetQueryParam(value);
  });

  @action
  updateStreet(event: Event) {
    const input = (event.target as HTMLInputElement).value.trim();
    if (input) {
      this.updateStreetTask.perform(input);
    } else {
      this.updateStreetQueryParam(null);
    }
  }

  @action
  updateDistance(selectedDistance: DistanceOption) {
    this.distanceList.selected = selectedDistance;
    this.filterService.updateFilters({
      distance: selectedDistance,
    });
  }
}
