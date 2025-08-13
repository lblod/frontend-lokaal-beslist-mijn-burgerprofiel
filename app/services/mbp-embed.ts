import Service from '@ember/service';

import config from '../config/environment';

import type { MbpEmbedClient } from '@govflanders/mbp-embed-sdk';
import { createMbpEmbedClient } from '@govflanders/mbp-embed-sdk';

export default class MbpEmbedService extends Service {
  declare client: MbpEmbedClient;

  get clientId() {
    return config.APP.MBP_CLIENT_ID;
  }

  async setup() {
    alert('setup', JSON.stringify(config));
    if (!this.clientId) {
      throw new Error(
        'MBP_CLIENT_ID is not set in the environment configuration.',
      );
    }

    alert('id:' + this.clientId);
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
      alert('connected');
      console.log('MBP SDK connected!');
      this.client.ui.setStatusLoading(false);
    } catch (e) {
      console.error('MBP SDK connection failed:', e);
      alert('something went wrong');
    }
  }

  clearTitle() {
    this.client?.ui.setTitle('');
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
