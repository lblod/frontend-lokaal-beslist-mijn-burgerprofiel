import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type { ModelFrom } from '../../lib/type-utils';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import type AgendaItemsAgendaItemSessionRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/session';
import type RouterService from '@ember/routing/router-service';
import type NavigationService from 'frontend-burgernabije-besluitendatabank/services/navigation';

export default class AgendaItemsAgendaItemSessionController extends Controller {
  @service declare router: RouterService;
  @service declare navigation: NavigationService;
  /** Used to fetch agenda items from the model */
  declare model: ModelFrom<AgendaItemsAgendaItemSessionRoute>;

  get agendaItemsSorted() {
    let agendaItems = this.model.session?.hasMany('agendaItems').value() as
      | AgendaItem[]
      | null;

    if (!agendaItems) {
      agendaItems = [];
    }

    return agendaItems
      .slice()
      .filter(({ title }) => !!title)
      .sort(sortObjectsByTitle);
  }

  @action
  toAgendapunt() {
    this.navigation.goToPreviousRoute();
  }
}
