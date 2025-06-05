import { modifier } from 'ember-modifier';
import type { MbpEmbedClient } from '@govflanders/mbp-embed-sdk';
import { createMbpEmbedClient } from '@govflanders/mbp-embed-sdk';

export default modifier(function initializeMbpSdk(
  element: HTMLElement,
  [clientId]: [string],
) {
  (async () => {
    const client: MbpEmbedClient = createMbpEmbedClient(clientId, {
      allowedHosts: [
        'https://*.burgerprofiel.be/*',
        'https://admin.vlaanderen.be/*',
        'https://mbp.lokaalbeslist.lblod.info/',
      ],
      element,
    });

    try {
      await client.connect();
      console.log('MBP SDK connected!');
    } catch (e) {
      console.error('MBP SDK connection failed:', e);
    }
  })();
});
