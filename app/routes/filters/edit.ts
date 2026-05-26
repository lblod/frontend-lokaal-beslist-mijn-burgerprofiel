import Route from '@ember/routing/route';

import { service } from '@ember/service';

import type Transition from '@ember/routing/transition';

import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

interface Params {
  id: number;
}

export default class FilterEditRoute extends Route {
  @service declare distanceList: DistanceListService;
  @service declare filterService: FilterService;
  @service declare mbpEmbed: MbpEmbedService;
  @service declare governingBodyList: GoverningBodyListService;

  beforeModel() {
    this.mbpEmbed.setLoadingStateFalse();
  }

  async model(params: Params, transition: Transition) {
    let editingFilter = null;
    if (params.id >= 0) {
      editingFilter = this.filterService.savedFilters[params.id] ?? null;
      if (editingFilter) {
        this.filterService.loadFilter(editingFilter);
      }
    }
    this.governingBodyList.loadOptions();
    return {
      agendaStatusOptions: ['Alles', 'Behandeld', 'Niet behandeld'],
      distanceOptions: this.distanceList.getOptions(),
      previousRoute: transition?.from,
      initialQueryParams: this.filterService.asQueryParams,
      editingFilter,
      id: params.id,
    };
  }
}
