import Service, { service } from '@ember/service';

import config from '../config/environment';

import type { MbpEmbedClient, Tenant } from '@govflanders/mbp-embed-sdk';
import type FilterService from './filter-service';

import { createMbpEmbedClient } from '@govflanders/mbp-embed-sdk';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

const HIDDEN_SPACE = '‎';

export default class MbpEmbedService extends Service {
  @service declare filterService: FilterService;

  declare client: MbpEmbedClient;
  declare tenant: Tenant;
  declare municipalityLabel?: string;
  declare isConnected: boolean;

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
      this.isConnected = true;
      console.log('MBP SDK connected!');
      this.client.ui.setStatusLoading(false);
    } catch (e) {
      this.isConnected = false;
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

  openNewEmbed(parameters: { routeName: string; id?: string }) {
    const { routeName, id } = parameters;
    const baseUrl = window.location.origin;
    const routeUrlMapping: Record<
      string,
      {
        isValid: boolean;
        url: string;
        backLinkLabel: string | null;
        pageTitle: string | null;
      }
    > = {
      ['agenda-items.agenda-item']: {
        isValid: !!id,
        url: `${baseUrl}/${id}`,
        backLinkLabel: 'Agendapunten',
        pageTitle: 'Agendapunt',
      },
      ['sessions.session']: {
        isValid: !!id,
        url: `${baseUrl}/zittingen/${id}`,
        backLinkLabel: 'Zittingen',
        pageTitle: 'Zitting',
      },
      ['filter']: {
        isValid: true,
        url: `${baseUrl}/filters`,
        backLinkLabel: null,
        pageTitle: 'Filters',
      },
    };
    const data = routeUrlMapping[routeName];
    if (data) {
      if (!data.isValid) {
        throw new Error(
          `Kon niet navigeren naar "${routeName}", parameters zijn niet correct.`,
        );
      }
      const queryParams = this.filterService.asUrlQueryParams;
      this.client.navigation
        .openNewEmbed(`${data.url}${queryParams}`)
        .then(() => {
          this.client.ui.setBacklinkLabel(data.backLinkLabel ?? HIDDEN_SPACE);
          this.client?.ui.setTitle(data.pageTitle || HIDDEN_SPACE);
        });
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
