import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import type RouterService from '@ember/routing/router-service';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from '../../services/items-service';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';

export default class AgendaItemsIndexController extends Controller {
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;
  @service declare distanceList: DistanceListService;
  @service declare address: AddressService;
  @service declare router: RouterService;
  @tracked hasFilter = false;

  @action
  resetFilters() {
    this.distanceList.selected = null;
    this.address.selectedAddress = null;
    this.filterService.resetFiltersToInitialView();
    this.router.transitionTo(this.router.currentRouteName, {
      queryParams: this.filterService.resetQueryParams,
    });
  }

  @action
  goToFilters() {
    this.router.transitionTo('filter');
  }

  @action
  refreshRoute() {
    this.router.transitionTo(this.router.currentRouteName, {
      queryParams: this.filterService.asQueryParams,
    });
  }
}
