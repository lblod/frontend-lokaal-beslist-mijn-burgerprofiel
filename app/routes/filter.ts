import Route from '@ember/routing/route';

import { service } from '@ember/service';

import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

export default class FilterRoute extends Route {
  @service declare governingBodyList: GoverningBodyListService;

  model() {
    return {
      bestuursorgaanOptions: this.governingBodyList.options,
      agendaStatusOptions: ['Alles', 'Behandeld', 'Niet behandeld'],
      themaOptions: [
        { label: 'Onderwijs' },
        { label: 'Cultuur' },
        { label: 'Vrije tijd' },
      ],
    };
  }
}
