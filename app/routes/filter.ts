import Route from '@ember/routing/route';

import { service } from '@ember/service';

import type Transition from '@ember/routing/transition';

import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';

export default class FilterRoute extends Route {
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async model(params = {}, transition: Transition) {
    await this.themeList.fetchThemes();
    const distanceOptions = await this.distanceList.loadOptions();

    return {
      agendaStatusOptions: ['Alles', 'Behandeld', 'Niet behandeld'],
      themaOptions: this.themeList.asOptions,
      distanceOptions,
      previousRoute: transition?.from,
    };
  }
}
