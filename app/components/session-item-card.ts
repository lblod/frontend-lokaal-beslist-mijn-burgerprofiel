import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export interface SessionItemCardSignature {
  // The arguments accepted by the component
  Args: {
    item: { id: string };
  };
  // Any blocks yielded by the component
  Blocks: {
    default: [];
  };
  // The element to which `...attributes` is applied in the component template
  Element: null;
}

export default class SessionItemCard extends Component<SessionItemCardSignature> {
  @service declare router: RouterService;
  @service declare mbpEmbed: MbpEmbedService;

  @action
  goToSessionItem() {
    this.router.transitionTo('sessions.session', this.args.item.id);
  }

  get showMunicipality() {
    return this.mbpEmbed.isLoggedInAsVlaanderen;
  }
}
