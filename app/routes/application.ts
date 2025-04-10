import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type PlausibleService from 'ember-plausible/services/plausible';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';

export default class ApplicationRoute extends Route {
  @service declare plausible: PlausibleService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;

  beforeModel(): void {
    this.startAnalytics();
    this.setGoverningBodyDisabledList();
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
