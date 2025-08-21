import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type RouterService from '@ember/routing/router-service';
import type { FiltersAsQueryParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';

export interface MbpEmbedResetEmbedHistoryAndOpenLinkSignature {
  Args: {
    routeName: string;
    query: Partial<FiltersAsQueryParams>;
  };
}

export default class MbpEmbedResetEmbedHistoryAndOpenLink extends Component<MbpEmbedResetEmbedHistoryAndOpenLinkSignature> {
  @service declare mbpEmbed: MbpEmbedService;
  @service declare router: RouterService;

  @action
  resetViewsAndOpenLink() {
    if (this.mbpEmbed.isConnected) {
      this.openNewEmbedWhenOverviewPage();
    } else {
      this.router.transitionTo(this.args.routeName, {
        queryParams: this.args.query,
      });
    }
  }

  openNewEmbedWhenOverviewPage() {
    alert(window.location.pathname);
    if (
      window.location.pathname === '/' ||
      window.location.pathname === '/zittingen'
    ) {
      this.router.transitionTo(this.args.routeName, {
        queryParams: this.args.query,
      });
    } else {
      this.mbpEmbed.client.navigation.back();
      this.mbpEmbed.client.navigation.back();
    }
  }
}
