import Service from '@ember/service';

import config from '../config/environment';

import type { MbpEmbedClient, Tenant } from '@govflanders/mbp-embed-sdk';
import type Transition from '@ember/routing/transition';

import { createMbpEmbedClient } from '@govflanders/mbp-embed-sdk';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export default class MbpEmbedService extends Service {
  declare client: MbpEmbedClient;
  declare tenant: Tenant;
  declare municipalityLabel?: string;

  get clientId() {
    return config.APP.MBP_CLIENT_ID;
  }

  get isLoggedInAsVlaanderen() {
    return !this.municipalityLabel;
  }

  async setup(gemeentesQueryParam?: string) {
    if (gemeentesQueryParam) {
      this.municipalityLabel = deserializeArray(gemeentesQueryParam)?.[0];
    }
    await this.connectToClient();
    this.tenant = await this.client?.context.getTenant();
    this.setAppColors();
  }

  async connectToClient() {
    if (!this.clientId) {
      throw new Error(
        'MBP_CLIENT_ID is not set in the environment configuration.',
      );
    }

    this.client = createMbpEmbedClient(this.clientId, {
      allowedHosts: [
        'https://mbp.lokaalbeslist.lblod.info/',
        'https://admin.vlaanderen.be/debug/embeds',
        'https://*.burgerprofiel.be/*',
        'https://admin.vlaanderen.be/*',
        'https://admin.vlaanderen.be',
      ],
    });

    try {
      await this.client.connect();
      console.log('MBP SDK connected!');
      this.client.ui.setStatusLoading(false);
    } catch (e) {
      console.error('MBP SDK connection failed:', e);
    }
  }

  setAppColors() {
    if (!this.tenant) {
      return;
    }

    document.documentElement.style.setProperty(
      '--au-blue-700',
      this.tenant.branding.primaryColor,
    );
    document.documentElement.style.setProperty(
      '--au-gray-900',
      this.tenant.branding.actionColor,
    );
  }

  setRouteTitle(transition?: Transition) {
    if (!transition) {
      this.client?.ui.setTitle('');
      return;
    }

    const routeTitleMap: Record<string, string> = {
      ['agenda-items.agenda-item']: 'Agendapunt',
      ['sessions.session']: 'Zitting',
      ['filter']: 'Filters',
    };
    const hiddenSpace = '‎';
    let routeTitle = hiddenSpace;
    if (transition.to?.name && routeTitleMap[transition.to.name]) {
      routeTitle = routeTitleMap[transition.to.name] || hiddenSpace;
    }
    this.client?.ui.setTitle(routeTitle);
  }

  async manageRouting(transition: Transition) {
    if (!this.client) {
      return;
    }

    const openNewEmbedRouteNames = ['agenda-items.agenda-item'];

    if (openNewEmbedRouteNames.includes(transition.to?.name ?? '')) {
      await this.client.navigation.openNewEmbed(
        'https://mbp.lokaalbeslist.lblod.info/3d814daa-cbe8-550b-9d41-f3caa9b2c2a5',
      );
    }

    const navigateBackRouteNames = ['agenda-items.index'];

    if (navigateBackRouteNames.includes(transition.to?.name ?? '')) {
      await this.client.navigation.back();
    }
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:mbp-embed')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('mbp-embed') declare altName: MbpEmbedService;`.
declare module '@ember/service' {
  interface Registry {
    'mbp-embed': MbpEmbedService;
  }
}
