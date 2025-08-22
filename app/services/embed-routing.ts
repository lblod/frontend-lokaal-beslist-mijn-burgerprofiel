import Service, { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import type Transition from '@ember/routing/transition';
import type RouterService from '@ember/routing/router-service';
import type MbpEmbedService from './mbp-embed';

import type { MbpEmbedClient } from '@govflanders/mbp-embed-sdk';

export default class EmbedRoutingService extends Service {
  @service declare router: RouterService;
  @service declare mbpEmbed: MbpEmbedService;

  @tracked historyTransitions: Array<Transition> = [];
  @tracked blackHole = false;

  setup() {
    if (!this.mbpEmbed.clientId) {
      return;
    }
    this.mbpEmbed.client.navigation.onBackNavigation(() => {
      return this.trigger;
    });
  }

  get trigger() {
    return this.cbForOnBackNavigation({
      router: this.router,
      mbpClient: this.mbpEmbed.client,
      current: this.currentTransition,
      isOnOverview: this.currentRouteIsOverview,
      historyItems: this.historyTransitions,
    });
  }

  cbForOnBackNavigation({
    router,
    mbpClient,
    current,
    isOnOverview,
    historyItems,
  }: {
    router: RouterService;
    mbpClient: MbpEmbedClient;
    current: Transition | undefined;
    isOnOverview: boolean;
    historyItems: Array<Transition>;
  }): boolean {
    alert('in cb');
    Promise.resolve(() => {
      alert('in resolve');
      if (!current?.from || isOnOverview) {
        alert('no previous or overview');
        mbpClient.navigation.back();
        return false;
      }
      alert('to ember route ');
      alert(current.from.name);
      if (current.from.params['id']) {
        router.transitionTo(current.from.name, current.from.params['id'], {
          queryParams: current.from.queryParams,
        });
      } else {
        router.transitionTo(current.from.name, {
          queryParams: current.from.queryParams,
        });
      }
      historyItems.shift();

      return false;
    });
    alert('return false to cb');
    return false;
  }

  get currentTransition() {
    return this.historyTransitions?.[0];
  }

  get currentRouteIsOverview() {
    return this.overviewRoutes.includes(this.currentTransition?.to?.name ?? '');
  }

  get overviewRoutes() {
    return ['agenda-items.index', 'sessions.index'];
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:embed-routing')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('embed-routing') declare altName: EmbedRoutingService;`.
declare module '@ember/service' {
  interface Registry {
    'embed-routing': EmbedRoutingService;
  }
}
