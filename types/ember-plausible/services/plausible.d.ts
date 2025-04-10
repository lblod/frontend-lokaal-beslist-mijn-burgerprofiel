declare module 'ember-plausible/services/plausible' {
  import type Service from '@ember/service';

  // https://github.com/redpencilio/ember-plausible#configuration-options
  interface PlausibleOptions {
    domain: string | string[];
    apiHost: string;
    trackLocalhost?: boolean;
    hashMode?: boolean;
    enableAutoPageviewTracking?: boolean;
    enableAutoOutboundTracking?: boolean;
  }

  export default class PlausibleService extends Service {
    isEnabled: boolean;
    isAutoPageviewTrackingEnabled: boolean;
    isAutoOutboundTrackingEnabled: boolean;

    enable(options: PlausibleOptions): void;
    trackPageview(): Promise<void>;
    trackEvent(eventName: string, props: object): Promise<void>;
    enableAutoPageviewTracking(): void;
    disableAutoPageviewTracking(): void;
    enableAutoOutboundTracking(): void;
    disableAutoOutboundTracking(): void;
  }
}
