import Route from '@ember/routing/route';

import { service } from '@ember/service';

import type Transition from '@ember/routing/transition';

import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';

export default class FilterRoute extends Route {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare filterService: FilterService;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async model(params = {}, transition: Transition) {
    await this.themeList.fetchThemes();
    const distanceOptions = await this.distanceList.loadOptions();
    const bestuursorgaanOptions =
      await this.governingBodyList.fetchBestuursorgaanOptions(
        this.filterService.municipalityLabels,
      );

    return {
      bestuursorgaanOptions: bestuursorgaanOptions,
      agendaStatusOptions: ['Alles', 'Behandeld', 'Niet behandeld'],
      themaOptions: this.themeList.asOptions,
      distanceOptions,
      previousRoute: transition?.from,
    };
  }
}
