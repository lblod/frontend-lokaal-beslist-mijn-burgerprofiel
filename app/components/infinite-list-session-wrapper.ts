import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';

export default class InfiniteListSessionWrapper extends Component {
  @service('item-list') declare itemsService: ItemListService;

  get isLoadingInitialValues() {
    return (
      this.itemsService.fetchItems.isRunning &&
      this.itemsService.items?.length === 0
    );
  }

  get isLoading() {
    return this.itemsService.fetchItems.isRunning;
  }

  get hasItems() {
    return this.itemsService.items.length >= 1;
  }

  get items() {
    return this.itemsService.items;
  }

  get totalItems() {
    return this.itemsService.totalItemCount;
  }

  @action
  loadMoreItems() {
    this.itemsService.loadMoreItems();
  }
}
