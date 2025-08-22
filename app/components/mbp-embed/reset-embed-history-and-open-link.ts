import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { timeout } from 'ember-concurrency';

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
  async resetViewsAndOpenLink() {
    if (this.mbpEmbed.isConnected) {
      await this.openNewEmbedWhenOverviewPage();
    } else {
      this.router.transitionTo(this.args.routeName, {
        queryParams: this.args.query,
      });
    }
  }

  async openNewEmbedWhenOverviewPage() {
    for (let view = 0; view < this.mbpEmbed.openViews; view++) {
      this.mbpEmbed.client.navigation.back();
      await timeout(120);
    }
    this.router.transitionTo(this.args.routeName, {
      queryParams: this.args.query,
    });
  }
}
