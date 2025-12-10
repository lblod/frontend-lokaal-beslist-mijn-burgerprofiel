import Service from '@ember/service';

import config from '../config/environment';

import type { MbpEmbedClient, Tenant } from '@govflanders/mbp-embed-sdk';
import type Transition from '@ember/routing/transition';

import { createMbpEmbedClient } from '@govflanders/mbp-embed-sdk';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import { tracked } from '@glimmer/tracking';

export default class MbpEmbedService extends Service {
  @tracked client?: MbpEmbedClient;
  @tracked deviceId: string | null = localStorage.getItem('deviceId') || null;
  declare tenant?: Tenant;
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

  get getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
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
      this.deviceId = this.getOrCreateDeviceId;
      this.client.ui.setStatusLoading(false);
      const permissions =
        await this.client.notifications.getNotificationPermissions();

      if (!permissions.granted) {
        console.warn('Notifications not allowed by user.');
        // You might request permission here if the SDK supports it
      }

      const notificationId =
        await this.client.notifications.scheduleNotification({
          content: {
            subtitle: 'Herinnering',
            body: 'Uw afspraak bij het gemeentehuis is morgen om 10:00.',
            data: { appointmentId: 'abc123' },
            priority: 'high',
          },
          trigger: {
            date: new Date(Date.now() + 10 * 60 * 1000), // in 10 minutes
          },
          action: {
            type: 'embed',
            url: '/afspraken/abc123',
          },
        });
      const all = await this.client.notifications.getAllNotifications();
      console.table(all);
      console.log(notificationId);
    } catch (e) {
      console.error('MBP SDK connection failed:', e);
    }
  }

  setLoadingStateFalse() {
    this.client?.ui.setStatusLoading(false);
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
      ['filters']: 'Filters',
      ['filters.edit']: 'Eigen filters',
    };
    const hiddenSpace = '‎';
    let routeTitle = hiddenSpace;
    if (transition.to?.name && routeTitleMap[transition.to.name]) {
      routeTitle = routeTitleMap[transition.to.name] || hiddenSpace;
    }
    this.client?.ui.setTitle(routeTitle);
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
