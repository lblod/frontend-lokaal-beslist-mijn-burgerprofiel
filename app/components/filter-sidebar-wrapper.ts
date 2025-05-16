import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type {
  AgendaItemsParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';

interface FilterSidebarWrapperArgs {
  filters: AgendaItemsParams;
  onFiltersChange: (filters: AgendaItemsParams) => void;
  dateSort: SortType;
  hasFilter: boolean;
}

export default class FilterSidebarWrapper extends Component<FilterSidebarWrapperArgs> {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare themeList: ThemeListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;

  /** Data quality modal */
  // @tracked modalOpen = false;

  get governigBodyOptions() {
    return this.governingBodyList.options;
  }
  get showAdvancedFilters() {
    return this.filterService.filters.governingBodyClassifications.length > 0;
  }

  get statusOfAgendaItemsOptions() {
    return ['Alles', 'Behandeld', 'Niet behandeld'];
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
}
