import Route from '@ember/routing/route';

import { service } from '@ember/service';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export default class TestRoute extends Route {
  @service declare mbpEmbed: MbpEmbedService;

  async model() {
    await this.mbpEmbed.client?.notifications.scheduleNotification({
      content: {
        subtitle: 'Herinnering',
        body: 'Test notification.',
        data: { appointmentId: 'abc123' },
        priority: 'high',
      },
      trigger: {
        date: new Date(Date.now() + 1 * 5 * 1000), // in 5 seconds
      },
      action: {
        type: 'embed',
        url: '/afspraken/abc123',
      },
    });
  }
}
