import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

export default class Session extends Component {
  @service declare router: RouterService;

  @action
  goToAgendaItem(item: AgendaItemModel) {
    this.router.transitionTo('agenda-items.agenda-item', item.id);
  }
}
