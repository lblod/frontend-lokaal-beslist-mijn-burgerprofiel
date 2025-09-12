import Service, { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';

export default class NavigationService extends Service {
  @service declare router: RouterService;

  @tracked transitionHistory: Array<Transition> = [];

  onIncomingTransition(transition: Transition) {
    this.transitionHistory.unshift(transition);
  }

  goToPreviousRoute() {
    const transition = this.transitionHistory[0];

    if (this.canGoBack && transition?.from) {
      this.transitionHistory.shift();
      window.history.back();
      return;
    }

    if (this.router.currentRoute.parent) {
      this.router.transitionTo(
        this.router.currentRoute.parent.name + '.index',
        this.router.currentRoute.parent.queryParams,
      );
    } else {
      this.router.transitionTo('agenda-items.index');
    }
  }

  get canGoBack() {
    return (
      this.transitionHistory.length >= 1 && this.transitionHistory[0]?.from
    );
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
