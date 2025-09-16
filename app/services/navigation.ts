import Service, { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type RouteInfo from '@ember/routing/route-info';
import type { RouteInfoWithAttributes } from '@ember/routing/route-info';

export default class NavigationService extends Service {
  @service declare router: RouterService;

  @tracked history: Array<RouteInfo | RouteInfoWithAttributes> = [];
  @tracked isNavigatingBack = false;

  onIncomingTransition(transition: Transition) {
    if (this.isNavigatingBack) {
      this.isNavigatingBack = false;
    } else {
      const toRoute = transition.to;
      if (toRoute) {
        this.history.unshift(toRoute);
      }

      if (this.history.length > 20) {
        alert('cleanup');
        this.history.pop(); // Cleanup
      }
    }
  }

  goToPreviousRoute() {
    if (this.history.length < 2) {
      return this.fallbackRouteToParent();
    }

    this.history.shift();
    const previous = this.history[0];
    if (previous) {
      this.isNavigatingBack = true;
      this.transitionToRoute(previous);
    }
  }

  get backLabel() {
    const route = this.history[1];

    if (!route) {
      return 'Terug';
    }

    return (
      {
        ['agenda-items.index']: 'Alle agendapunten',
        ['agenda-items.agenda-item']: 'Agendapunt',
        ['sessions.index']: 'Alle zittingen',
        ['sessions.session']: 'Zitting',
      }[route.name] || 'Terug'
    );
  }

  transitionToRoute(route: RouteInfo | RouteInfoWithAttributes) {
    const allowedParamKeys = ['id', 'session_id'];
    const paramKey = route.paramNames.find((key) =>
      allowedParamKeys.includes(key),
    );
    if (paramKey) {
      this.router.transitionTo(route.name, route?.params[paramKey] as string);
    } else {
      if (route.parent) {
        this.router.transitionTo(route.parent.name + '.index');
      } else {
        this.router.transitionTo('agenda-items.index');
      }
    }
  }

  fallbackRouteToParent() {
    const params = this.router.currentRoute.parent?.queryParams;
    if (
      this.router.currentRoute.parent &&
      params &&
      Object.keys(params).length >= 1
    ) {
      this.router.transitionTo(
        this.router.currentRoute.parent.name + '.index',
        params,
      );
    } else {
      this.router.transitionTo('agenda-items.index');
    }
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:navigation')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('navigation') declare altName: NavigationService;`.
declare module '@ember/service' {
  interface Registry {
    navigation: NavigationService;
  }
}
