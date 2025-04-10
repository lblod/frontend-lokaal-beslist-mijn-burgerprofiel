import type {
  AsyncBelongsTo,
  AsyncHasMany,
  SyncHasMany,
} from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { sortSessions } from 'frontend-burgernabije-besluitendatabank/utils/sort-sessions';
import type AgendaItemHandlingModel from './agenda-item-handling';
import type ResolutionModel from './resolution';
import type SessionModel from './session';

export default class AgendaItemModel extends Model {
  @attr('string') declare title: string;
  @attr('string') declare description: string;
  @attr() declare alternateLink: string[];
  @attr('boolean') declare plannedPublic: boolean;

  @hasMany('session', { async: true, inverse: 'agendaItems' })
  declare sessions?: AsyncHasMany<SessionModel>;

  @belongsTo('agenda-item-handling', { async: true, inverse: null })
  declare handledBy?: AsyncBelongsTo<AgendaItemHandlingModel>;

  /**
   * @returns the first session with hasMunicipality == true
   * This is the session we want to use to resolve municipality & governingBody name
   */
  get session() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    const sessions: SyncHasMany<SessionModel> | null = (this as AgendaItemModel)
      .hasMany('sessions')
      ?.value();

    // We want to use a session with municipality and start date in priority
    const session = sessions?.slice()?.sort(sortSessions)?.shift();

    return session;
  }

  get wasHandled() {
    return Boolean(this.session?.startedAt) || Boolean(this.session?.endedAt);
  }

  get municipality() {
    return this.session?.municipality;
  }

  get governingBodyIdResolved() {
    return this.session?.governingBodyResolved?.id;
  }

  get governingBodyNameResolved() {
    return this.session?.governingBodyNameResolved;
  }

  get dateFormatted() {
    return this.session?.dateFormatted;
  }

  get titleFormatted() {
    return (
      this.title ||
      (
        (
          (this as AgendaItemModel)
            .belongsTo('handledBy')
            .value() as AgendaItemHandlingModel
        )
          ?.hasMany('resolutions')
          .value() as unknown as ResolutionModel[]
      )?.[0]?.title ||
      'Ontbrekende titel'
    );
  }

  get agendaItemQualityMetrics(): { label: string; value: boolean }[] {
    const properties = [
      {
        property: 'title',
        formattedProperty: 'Titel',
      },
      {
        property: 'description',
        formattedProperty: 'Beschrijving',
      },
      {
        property: 'dateFormatted',
        formattedProperty: 'Datum',
      },
      {
        property: 'municipality',
        formattedProperty: 'Bestuurseenheid',
      },
      {
        property: 'governingBodyNameResolved',
        formattedProperty: 'Bestuursorgaan',
      },
    ];

    const qualityMetrics: { label: string; value: boolean }[] = [];

    properties.forEach((property) => {
      const value = this[property.property as keyof AgendaItemModel];
      qualityMetrics.push({
        label: property.formattedProperty,
        value: !!value,
      });
    });

    return qualityMetrics;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'agenda-item': AgendaItemModel;
  }
}
