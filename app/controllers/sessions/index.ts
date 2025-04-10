import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from '../../services/items-service';
import { runTask } from 'ember-lifeline';

export default class SessionsIndexController extends Controller {
  @service declare filterService: FilterService;
  @service declare router: RouterService;
  @service declare itemsService: ItemsService;
  @tracked hasFilter = false;

  get filters() {
    return this.filterService.filters;
  }

  @action
  showFilter() {
    this.hasFilter = true;
  }

  @action
  hideFilter() {
    runTask(this, () => {
      this.hasFilter = false;
    });
  }
}
