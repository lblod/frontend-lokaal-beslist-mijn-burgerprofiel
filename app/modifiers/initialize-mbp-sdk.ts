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
        'https://mbp.lokaalbeslist.lblod.info/',
        'https://admin.vlaanderen.be/debug/embeds',
        'https://*.burgerprofiel.be/*',
        'https://admin.vlaanderen.be/*',
        'https://admin.vlaanderen.be',
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
