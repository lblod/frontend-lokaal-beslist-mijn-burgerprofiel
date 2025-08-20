import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type RouterService from '@ember/routing/router-service';

export interface OpenLinkAsEmbedSignature {
  Args: {
    routeName: string;
    id: string;
  };
}

export default class OpenLinkAsEmbed extends Component<OpenLinkAsEmbedSignature> {
  @service declare mbpEmbed: MbpEmbedService;
  @service declare router: RouterService;

  @action
  openAsEmbed() {
    if (this.mbpEmbed.isConnected) {
      this.mbpEmbed.openNewEmbed({
        routeName: this.args.routeName,
        id: this.args.id,
      });
    } else {
      this.router.transitionTo(this.args.routeName, this.args.id);
    }
  }
}
