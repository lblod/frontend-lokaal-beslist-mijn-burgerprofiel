import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';

import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';

export default class FilterController extends Controller {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;

  /** Data quality modal */
  // @tracked modalOpen = false;
  get governingBodyOptions() {
    return this.governingBodyList.options;
  }
  get showAdvancedFilters() {
    return this.filterService.filters.governingBodyClassifications?.length > 0;
  }

  get statusOfAgendaItemsOptions() {
    return ['Alles', 'Behandeld', 'Niet behandeld'];
  }

  get hasMunicipalityFilter() {
    return this.filterService.filters.municipalityLabels.length > 0;
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
  goToAgendaItems() {
    this.router.transitionTo('agenda-items.index');
  }

  @action
  async resetFilters() {
    this.governingBodyList.selected = [];
    this.filterService.resetFiltersToInitialView();
    this.goToAgendaItems();
  }
}
