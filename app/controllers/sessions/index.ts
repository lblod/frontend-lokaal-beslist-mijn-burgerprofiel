import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';

export default class SessionsIndexController extends Controller {
  @service declare filterService: FilterService;
  @service declare distanceList: DistanceListService;
  @service declare address: AddressService;
  @service declare governingBodyList: GoverningBodyListService;
  @service('item-list') declare itemsService: ItemListService;
  @service declare router: RouterService;
  @service declare governmentList: GovernmentListService;
  @service declare mbpEmbed: MbpEmbedService;

  @tracked hasFilter = false;

  @action
  resetFilters() {
    this.governingBodyList.selectedIds = [];
    this.address.selectedAddress = undefined;
    this.distanceList.selected = null;
    if (this.mbpEmbed.isLoggedInAsVlaanderen) {
      this.governmentList.selected = [];
    }
    this.filterService.resetFiltersToInitialView();
    this.itemsService.fetchItems.perform(0, false);
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
    this.itemsService.fetchItems.perform(0, false);
    this.router.transitionTo(this.router.currentRouteName, {
      queryParams: this.filterService.asQueryParams,
    });
  }
}
