import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export interface AgendaItemCardSignature {
  Args: {
    item: { id: string };
  };
}

export default class AgendaItemCard extends Component<AgendaItemCardSignature> {
  @service declare router: RouterService;
  @service declare mbpEmbed: MbpEmbedService;

  @action
  goToAgendaItem() {
    this.router.transitionTo('agenda-items.agenda-item', this.args.item.id);
  }

  get showMunicipality() {
    return this.mbpEmbed.isLoggedInAsVlaanderen;
  }
}
