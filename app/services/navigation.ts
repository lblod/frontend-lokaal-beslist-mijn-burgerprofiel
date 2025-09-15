import Service, { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';

export default class NavigationService extends Service {
  @service declare router: RouterService;

  @tracked transition?: Transition;
  @tracked beforeTransition?: Transition;

  onIncomingTransition(transition: Transition) {
    this.beforeTransition = this.transition;
    this.transition = transition;
  }

  goToPreviousRoute() {
    if (!this.transition) {
      return;
    }
    const current = this.transition.to;
    const previous = this.transition.from;

    if (
      previous?.name === 'agenda-items.session' &&
      current?.name === 'agenda-items.agenda-item'
    ) {
      if (
        previous.params &&
        'id' in previous.params &&
        previous?.name !== 'agenda-items.session'
      ) {
        this.router.transitionTo(
          previous.name,
          this.transition.to?.params['id'] as string,
        );
      } else {
        if (previous.parent) {
          this.router.transitionTo(previous.parent.name + '.index');
        }
      }

      return;
    }

    if (previous) {
      const previousUrl = window.location.href;
      window.history.back();
      setTimeout(() => {
        if (window.location.href === previousUrl) {
          // nothing happened → fallback
          this.router.transitionTo('agenda-items.index');
        }
      }, 200);
      return;
    }

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
