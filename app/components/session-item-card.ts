import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export interface SessionItemCardSignature {
  Args: {
    item: { id: string };
  };
}

export default class SessionItemCard extends Component<SessionItemCardSignature> {
  @service declare router: RouterService;
  @service declare mbpEmbed: MbpEmbedService;

  @action
  goToSessionItem() {
    if (this.mbpEmbed.isConnected) {
      this.mbpEmbed.openNewEmbed({
        routeName: 'sessions.session',
        id: this.args.item.id,
      });
    } else {
      this.router.transitionTo('sessions.session', this.args.item.id);
    }
  }

  get showMunicipality() {
    return this.mbpEmbed.isLoggedInAsVlaanderen;
  }
}
