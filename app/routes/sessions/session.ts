import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

export default class SessionRoute extends Route {
  @service declare store: Store;
  @service declare mbpEmbed: MbpEmbedService;
  @service declare governingBodyList: GoverningBodyListService;

  @tracked governingBodies: { label: string }[] | null = null;
  @tracked otherSessions: {
    sessions: SessionModel[];
    count?: number;
  } | null = null;
  @tracked sortedAgendaItems: AgendaItemModel[] | null = null;

  beforeModel() {
    this.mbpEmbed.setLoadingStateFalse();
  }

  async model({ session_id }: { session_id: string }) {
    const session = await this.store.findRecord('session', session_id);
    const govBody = await session.get('governingBody');
    const resolvedGovBody = await govBody?.get('isTimeSpecializationOf');
    const governingBody = resolvedGovBody ?? govBody;
    const classification = await governingBody.get('classification');
    return {
      session,
      agendaItems: this.loadAgendaItemsTask.perform(session, 'titleFormatted'),
      otherSessions: this.loadOtherSessionsTask.perform(governingBody, session),
      governingBodies: this.loadGoverningBodiesTask.perform(governingBody),
      classification,
    };
  }

  readonly loadAgendaItemsTask = task(
    { restartable: true },
    async (
      session: SessionModel,
      sortKey: keyof { titleFormatted: string },
    ) => {
      try {
        const agendaItems = await session.get('agendaItems');
        if (!agendaItems || !sortKey) {
          return;
        }

        return agendaItems.slice().sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue, undefined, { numeric: true });
          }

          return 0;
        });
      } catch (error) {
        console.error('Error sorting agenda items:', error);
        return;
      }
    },
  );
  readonly loadOtherSessionsTask = task(
    { restartable: true },
    async (resolvedGovBody: GoverningBodyModel, session: SessionModel) => {
      try {
        if (!resolvedGovBody) {
          return;
        }

        const otherSessions = (await this.store.query('session', {
          filter: {
            'governing-body': {
              'is-time-specialization-of': {
                ':id:': resolvedGovBody.id,
              },
            },
          },
          page: {
            size: 6,
          },
          sort: '-planned-start',
        })) as AdapterPopulatedRecordArrayWithMeta<SessionModel>;
        return {
          sessions: otherSessions
            .filter((s: SessionModel) => s.id !== session?.id)
            .slice(0, 5),
          count: otherSessions.meta?.count,
        };
      } catch (error) {
        console.error('Error fetching other sessions:', error);
        return;
      }
    },
  );
  readonly loadGoverningBodiesTask = task(
    { restartable: true },
    async (resolvedGovBody: GoverningBodyModel) => {
      try {
        if (!resolvedGovBody) {
          return;
        }
        const municipality = await resolvedGovBody?.get('administrativeUnit');
        const location = await municipality?.get('location');
        const governingBodies = await this.store.query('governing-body', {
          filter: {
            'administrative-unit': {
              location: { ':id:': location.id },
            },
          },
          'filter[:has:classification]': true,
        });
        const classifications =
          await this.governingBodyList.getClassificationsForGoverningBodies(
            governingBodies.slice(),
          );
        return this.governingBodyList
          .getUniqueClassifications(classifications)
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (error) {
        console.error('Error fetching governing bodies:', error);
        return;
      }
    },
  );
}
