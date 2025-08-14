import Route from '@ember/routing/route';

import { service } from '@ember/service';

import config from 'frontend-burgernabije-besluitendatabank/config/environment';

import type PlausibleService from 'ember-plausible/services/plausible';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export default class ApplicationRoute extends Route {
  @service declare plausible: PlausibleService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;
  @service declare mbpEmbed: MbpEmbedService;
  @service declare router: Route;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(args: { Args: any }) {
    super(args);

    this.router.on('routeDidChange', (transition) => {
      this.mbpEmbed.setRouteTitle(transition);
      alert(window.location.href);
    });
  }
  beforeModel(): void {
    this.startAnalytics();
    this.setGoverningBodyDisabledList();
    this.mbpEmbed.setup();
  }

  startAnalytics(): void {
    const { domain, apiHost } = config.plausible;

    if (!domain.startsWith('{{') && !apiHost.startsWith('{{')) {
      this.plausible.enable({
        domain,
        apiHost,
      });
    }
  }

  setGoverningBodyDisabledList(): void {
    this.governingBodyDisabledList.disabledList = !config[
      'governing-body-disabled'
    ].startsWith('{{')
      ? config['governing-body-disabled'].split(',')
      : [];
  }
}
