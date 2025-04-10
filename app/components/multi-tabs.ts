import Component from '@glimmer/component';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

export default class MultiTabsComponent extends Component {
  @service declare filterService: FilterService;
  @service declare router: RouterService;
  get filters() {
    return this.filterService.filters;
  }
}
