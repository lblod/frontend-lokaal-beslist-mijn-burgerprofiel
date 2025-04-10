import type Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';

interface Params {
  id: string;
}

export default class AgendaItemsAgendaItemSessionRoute extends Route {
  @service declare store: Store;

  async model({ id }: Params) {
    const agendaItem = await this.store.findRecord('agenda-item', id);
    const sessions = await agendaItem.sessions;
    let session: SessionModel | null = null;
    if (Array.isArray(sessions) && sessions.length > 0) {
      session = await this.store.findRecord(
        'session',
        sessions[0].id as string,
        {
          include: [
            'governing-body.is-time-specialization-of.administrative-unit.location',
            'governing-body.administrative-unit.location',
            'agenda-items',
          ].join(','),
        },
      );
    }

    return {
      agendaItem,
      session,
    };
  }
}
