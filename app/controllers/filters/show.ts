import Controller from '@ember/controller';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import type FilterRoute from 'frontend-burgernabije-besluitendatabank/routes/filters';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';

export default class FilterShowController extends Controller {
  @service declare filterService: FilterService;
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
  toggleNotification(index: number) {
    console.log(index);
    this.filterService.localStorageFilters =
      this.filterService.localStorageFilters.map((filter, i) => {
        if (i !== index) return filter;

        return { ...filter, notify: !filter.notify };
      });

    localStorage.setItem(
      'localStorageFilters',
      JSON.stringify(this.filterService.localStorageFilters),
    );
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
