import Route from '@ember/routing/route';

import { service } from '@ember/service';

import type Transition from '@ember/routing/transition';

import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export default class FilterRoute extends Route {
  @service declare distanceList: DistanceListService;
  @service declare filterService: FilterService;
  @service declare mbpEmbed: MbpEmbedService;

  beforeModel() {
    this.mbpEmbed.setLoadingStateFalse();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async model(params = {}, transition: Transition) {
    return {
      agendaStatusOptions: ['Alles', 'Behandeld', 'Niet behandeld'],
      distanceOptions: this.distanceList.getOptions(),
      previousRoute: transition?.from,
      initialQueryParams: this.filterService.asQueryParams,
    };
  }
}
