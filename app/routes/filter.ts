import Route from '@ember/routing/route';

import { service } from '@ember/service';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';

import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';

export default class FilterRoute extends Route {
  @service declare governingBodyList: GoverningBodyListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;

  async model() {
    const themaOptions = await this.themeList.loadOptions();
    const distanceOptions = await this.distanceList.loadOptions();

    return {
      bestuursorgaanOptions: this.governingBodyList
        .options as Array<GoverningBodyOption>,
      agendaStatusOptions: ['Alles', 'Behandeld', 'Niet behandeld'],
      themaOptions,
      distanceOptions,
    };
  }
}
