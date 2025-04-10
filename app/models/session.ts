import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { getFormattedDate } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date';
import { getFormattedDateRange } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date-range';
import type AgendaItemModel from './agenda-item';
import type GoverningBodyModel from './governing-body';

export default class SessionModel extends Model {
  @attr('date') declare plannedStart?: Date;
  @attr('date') declare startedAt?: Date;
  @attr('date') declare endedAt?: Date;

  @hasMany('agenda-item', { async: true, inverse: 'sessions' })
  declare agendaItems: AsyncHasMany<AgendaItemModel>;

  @belongsTo('governing-body', { async: true, inverse: 'sessions' })
  declare governingBody: AsyncBelongsTo<GoverningBodyModel>;

  get governingBodyValue() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    return (this as SessionModel)
      .belongsTo('governingBody')
      ?.value() as GoverningBodyModel | null;
  }

  /**
   * @returns
   * - ... the session's timeSpecialised governing body's name
   * - ... if the above can't be found, the abstracted governing body's name
   * - ... if the above can't be found, an error string
   *
   * This naming scheme is in relation to the app/back-end
   */
  get governingBodyResolved() {
    return (
      this.governingBodyValue?.isTimeSpecializationOfValue ||
      this.governingBodyValue
    );
  }

  get governingBodyNameResolved() {
    return this.governingBodyResolved?.name || 'Ontbrekend bestuursorgaan';
  }

  get municipalityId() {
    return this.governingBodyResolved?.administrativeUnitValue?.locationValue
      ?.id;
  }

  get classification() {
    return this.governingBodyResolved?.classification?.get('label') || '';
  }

  get municipality() {
    return (
      this.governingBodyResolved?.administrativeUnitValue?.locationValue
        ?.label || 'Ontbrekende bestuurseenheid'
    );
  }
  get locationLevel() {
    return (
      this.governingBodyResolved?.administrativeUnitValue?.locationValue
        ?.niveau || 'Gemeente'
    );
  }
  get hasMunicipality() {
    return !!this.governingBodyResolved?.administrativeUnitValue?.locationValue;
  }

  get dateFormatted() {
    if (this.startedAt || this.endedAt) {
      return getFormattedDateRange(this.startedAt, this.endedAt);
    }
    if (this.plannedStart) {
      return 'Gepland op ' + getFormattedDate(this.plannedStart);
    }

    return 'Geen Datum';
  }

  get agendaItemCount() {
    const count = this.agendaItems?.length ?? 0;

    return `${count} ${+count <= 1 ? 'agendapunt' : 'agendapunten'}`;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    session: SessionModel;
  }
}
