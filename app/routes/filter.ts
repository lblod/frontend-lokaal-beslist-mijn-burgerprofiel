import Route from '@ember/routing/route';

import { service } from '@ember/service';

import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';

export default class FilterRoute extends Route {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare filterService: FilterService;

  async model() {
    await this.themeList.fetchThemes();
    const distanceOptions = await this.distanceList.loadOptions();
    const bestuursorgaanOptions =
      await this.governingBodyList.fetchBestuursorgaanOptions('Aalter'); // TODO: Not sure yet how we are going to FIX this value | SessionStorage?

    return {
      bestuursorgaanOptions: bestuursorgaanOptions,
      agendaStatusOptions: ['Alles', 'Behandeld', 'Niet behandeld'],
      themaOptions: this.themeList.asOptions,
      distanceOptions,
    };
  }
}
