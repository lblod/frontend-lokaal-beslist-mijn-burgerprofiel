import Service, { service } from '@ember/service';

import type Transition from '@ember/routing/transition';
import type RouterService from '@ember/routing/router-service';
import type { MbpEmbedClient } from '@govflanders/mbp-embed-sdk';

export default class EmbedRoutingService extends Service {
  @service declare router: RouterService;

  declare historyTransitions: Array<Transition>;

  setup(client?: MbpEmbedClient) {
    if (!client) {
      return;
    }

    this.historyTransitions = [];
    client.navigation.onBackNavigation(this.cbForOnBackNavigation);
    this.router.on('routeDidChange', (transition: Transition) => {
      this.historyTransitions.unshift(transition);
      alert('current: ' + this.currentTransition?.to?.name);
    });
  }

  cbForOnBackNavigation() {
    alert('back CB');
    if (!this.currentTransition || this.currentRouteIsOverview) {
      alert('no current or page is overview');
      return true;
    }
    const previousRouteInfo = this.currentTransition.from;
    if (previousRouteInfo && previousRouteInfo.params['id']) {
      this.router.transitionTo(
        previousRouteInfo.name,
        previousRouteInfo.params['id'],
        {
          queryParams: previousRouteInfo.queryParams,
        },
      );
    }
    if (previousRouteInfo) {
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
