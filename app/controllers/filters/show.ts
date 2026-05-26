import Controller from '@ember/controller';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import type FilterRoute from 'frontend-burgernabije-besluitendatabank/routes/filters';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type SessionService from 'frontend-burgernabije-besluitendatabank/services/session';

export default class FilterShowController extends Controller {
  @service declare filterService: FilterService;
  @service declare session: SessionService;
  @service declare router: RouterService;

  declare model: ModelFrom<FilterRoute>;

  @action
  closeFilters() {
    const routeName = 'agenda-items.index';

    this.router.transitionTo(routeName, {
      queryParams: this.model.initialQueryParams,
    });
  }

  @action
  async toggleNotification(index: number) {
    const target = this.filterService.savedFilters[index];
    if (!target) return;

    const updated = this.filterService.savedFilters.map((filter, i) =>
      i === index ? { ...filter, notify: !filter.notify } : filter,
    );
    this.filterService.updateSavedFilters(updated);

    const changed = updated[index];
    if (changed?.remoteId) {
      await this.filterService.updateRemoteFilter(changed.remoteId, {
        notify: changed.notify,
      });
    }
  }

  @action
  goToEditFilter(index: number) {
    this.router.transitionTo('filters.edit', index);
  }

  @action
  goToCreateFilter() {
    this.router.transitionTo('filters.edit', -1);
  }
}
