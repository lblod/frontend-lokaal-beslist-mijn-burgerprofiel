import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';
import type { SortType } from './types';
import { action } from '@ember/object';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from '../../services/items-service';
import { runTask } from 'ember-lifeline';

export default class AgendaItemsIndexController extends Controller {
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;
  @service declare router: RouterService;
  @tracked hasFilter = false;

  /** Controls the loading animation of the "load more" button */
  @tracked isLoadingMore = false;
  @tracked loading = false; // Controls the loading animation that replaces the main view
  @tracked errorMsg = ''; // Controls whether an Oops is shown

  @tracked dateSort: SortType = 'desc';

  get filters() {
    return this.filterService.filters;
  }

  @action
  hideFilter() {
    runTask(this, () => {
      this.hasFilter = false;
    });
  }
}
