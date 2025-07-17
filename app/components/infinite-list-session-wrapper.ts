import Component from '@glimmer/component';

import { service } from '@ember/service';

import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';

export default class InfiniteListSessionWrapper extends Component {
  @service declare filterService: FilterService;
  @service('item-list') declare itemsService: ItemListService;

  get filters() {
    return this.filterService.filters;
  }
}
