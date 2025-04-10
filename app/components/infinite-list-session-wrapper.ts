import Component from '@glimmer/component';
import { service } from '@ember/service';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';

export default class InfiniteListSessionWrapper extends Component {
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;

  get filters() {
    return this.filterService.filters;
  }
}
