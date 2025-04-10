import Controller from '@ember/controller';
import type { ModelFrom } from '../../lib/type-utils';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import type AgendaItemsAgendaItemSessionRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/session';

export default class AgendaItemsAgendaItemSessionController extends Controller {
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
}
