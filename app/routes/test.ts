import Route from '@ember/routing/route';

import { service } from '@ember/service';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export default class TestRoute extends Route {
  @service declare mbpEmbed: MbpEmbedService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(args: { Args: any }) {
    super(args);
  }

  async beforeModel() {
    await this.mbpEmbed.client?.notifications.scheduleNotification({
      content: {
        subtitle: 'Herinnering',
        body: 'Test notification.',
        data: { appointmentId: 'abc123' },
        priority: 'high',
      },
      trigger: {
        date: new Date(Date.now() + 1 * 60 * 1000), // in 1 minutes
      },
      action: {
        type: 'embed',
        url: '/afspraken/abc123',
      },
    });
  }
}
