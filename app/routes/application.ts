import Route from '@ember/routing/route';

import { A } from '@ember/array';
import { service } from '@ember/service';

import config from 'frontend-burgernabije-besluitendatabank/config/environment';

import type PlausibleService from 'ember-plausible/services/plausible';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type Transition from '@ember/routing/transition';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

export default class ApplicationRoute extends Route {
  @service declare plausible: PlausibleService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare themeList: ThemeListService;
  @service declare mbpEmbed: MbpEmbedService;
  @service declare router: Route;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(args: { Args: any }) {
    super(args);

    this.router.on('routeDidChange', (transition) => {
      this.mbpEmbed.setRouteTitle(transition);
      // alert(window.location.href);
    });
  }
  beforeModel(transition: Transition): void {
    this.startAnalytics();
    this.setGoverningBodyDisabledList();
    let gemeentes = undefined;
    if (transition.to?.queryParams) {
      gemeentes = transition.to?.queryParams['gemeentes'];
    }
    this.governingBodyList.getAll().then((options) => {
      this.governingBodyList.allOptions.clear();
      this.governingBodyList.allOptions.pushObjects(A(options));
    });
    this.mbpEmbed.setup(gemeentes);
    this.themeList.fetchThemes();
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
