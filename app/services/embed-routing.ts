import Service, { service } from '@ember/service';

import type Transition from '@ember/routing/transition';
import type RouterService from '@ember/routing/router-service';
import type MbpEmbedService from './mbp-embed';
import { tracked } from '@glimmer/tracking';

export default class EmbedRoutingService extends Service {
  @service declare router: RouterService;
  @service declare mbpEmbed: MbpEmbedService;

  declare historyTransitions: Array<Transition>;

  @tracked blackHole = false;

  setup() {
    if (!this.mbpEmbed.clientId) {
      return;
    }

    this.historyTransitions = [];
    this.mbpEmbed.client.navigation.onBackNavigation(() => {
      this.blackHole = this.trigger;
      return false;
    });
    this.router.on('routeDidChange', (transition: Transition) => {
      this.historyTransitions.unshift(transition);
    });
  }

  get trigger() {
    return this.cbForOnBackNavigation();
  }

  cbForOnBackNavigation(): boolean {
    alert('triggered ');
    const previousRouteInfo = this.currentTransition?.from;
    if (!previousRouteInfo || this.currentRouteIsOverview) {
      this.mbpEmbed.client.navigation.back();
      return false;
    }
    if (previousRouteInfo && previousRouteInfo.params['id']) {
      this.router.transitionTo(
        previousRouteInfo.name,
        previousRouteInfo.params['id'],
        {
          queryParams: previousRouteInfo.queryParams,
        },
      );
    } else {
      this.router.transitionTo(previousRouteInfo.name, {
        queryParams: previousRouteInfo.queryParams,
      });
    }
    this.historyTransitions.shift();

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
