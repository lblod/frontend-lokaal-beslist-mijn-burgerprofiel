import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type RouterService from '@ember/routing/router-service';
import type { FiltersAsQueryParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';

export interface OpenInFirstOverviewEmbedSignature {
  Args: {
    routeName: string;
    query: Partial<FiltersAsQueryParams>;
  };
}

export default class OpenInFirstOverviewEmbed extends Component<OpenInFirstOverviewEmbedSignature> {
  @service declare mbpEmbed: MbpEmbedService;
  @service declare router: RouterService;
  @service declare filterService: FilterService;

  @action
  openInFirstOverviewEmbed() {
    if (this.mbpEmbed.isConnected) {
      alert('going back' + this.mbpEmbed.openViews);
      for (let view = 0; view < this.mbpEmbed.openViews; view++) {
        this.mbpEmbed.client.navigation.back();
      }
      this.mbpEmbed.openNewEmbed({
        routeName: this.args.routeName,
      });
    } else {
      this.router.transitionTo(
        this.args.routeName,
        this.filterService.asQueryParams,
      );
    }
  }
}
