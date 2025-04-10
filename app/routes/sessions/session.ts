import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type ArrayProxy from '@ember/array/proxy';
import type AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';

export default class SessionRoute extends Route {
  @service declare store: Store;
  @tracked governingBodies: { label: string }[] | null = null;
  @tracked otherSessions: {
    sessions: SessionModel[];
    count?: number;
  } | null = null;
  @tracked sortedAgendaItems: AgendaItemModel[] | null = null;

  async model({ session_id }: { session_id: string }) {
    const session = await this.store.findRecord('session', session_id, {
      include: [
        'governing-body.is-time-specialization-of.administrative-unit.location',
        'governing-body.administrative-unit.location',
        'agenda-items.handled-by.resolutions',
      ].join(','),
    });
    const agendaItems = await session.get('agendaItems');
    const govBody = await session.get('governingBody');
    const resolvedGovBody = await govBody?.get('isTimeSpecializationOf');
    const governingBody = resolvedGovBody ?? govBody;
    const classification = await governingBody.get('classification');
    return {
      session,
      agendaItems: this.loadAgendaItemsTask.perform(
        agendaItems,
        'titleFormatted',
      ),
      otherSessions: this.loadOtherSessionsTask.perform(governingBody, session),
      governingBodies: this.loadGoverningBodiesTask.perform(governingBody),
      classificationLabel: classification.get('label'),
    };
  }

  readonly loadAgendaItemsTask = task(
    { restartable: true },
    async (
      agendaItems: ArrayProxy<AgendaItemModel>,
      sortKey: keyof { titleFormatted: string },
    ) => {
      try {
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
          include: 'classification',
          filter: {
            'administrative-unit': {
              location: { ':id:': location.id },
            },
          },
        });
        return getUniqueGoverningBodies(governingBodies);
      } catch (error) {
        console.error('Error fetching governing bodies:', error);
        return;
      }
    },
  );
}

function getUniqueGoverningBodies(
  governingBodies: AdapterPopulatedRecordArrayWithMeta<GoverningBodyModel>,
) {
  const uniqueLabels = new Set();
  return governingBodies
    .reduce(
      (unique, govBody) => {
        const label = govBody.get('classification').get('label');
        if (label && !uniqueLabels.has(label)) {
          uniqueLabels.add(label);
          unique.push({ label });
        }
        return unique;
      },
      [] as { label: string }[],
    )
    .sort((a, b) => a.label.localeCompare(b.label));
}
