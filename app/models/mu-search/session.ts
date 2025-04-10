import { getFormattedDate } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date';
import { getFormattedDateRange } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date-range';

export default class SessionModel {
  declare id?: string;
  declare locationId?: string;
  declare abstractGoverningBodyLocationName?: string;
  declare governingBodyLocationName?: string;
  declare abstractGoverningBodyName?: string;
  declare governingBodyName?: string;
  declare abstractGoverningBodyClassificationName?: string;
  declare governingBodyClassificationName?: string;
  declare plannedStart?: Date;
  declare startedAt?: Date;
  declare endedAt?: Date;
  declare agendaItemsId: Array<string>;

  get dateFormatted() {
    if (this.startedAt && this.endedAt) {
      return getFormattedDateRange(this.startedAt, this.endedAt);
    }
    if (this.plannedStart) {
      return 'gepland op ' + getFormattedDate(this.plannedStart);
    }

    return 'Geen Datum';
  }

  get agendaItemCount() {
    return this.agendaItemsId.length;
  }

  get governingBodyClassificationNameResolved() {
    return (
      this.abstractGoverningBodyClassificationName ||
      this.governingBodyClassificationName ||
      'Ontbrekend bestuursorgaan'
    );
  }

  get municipality() {
    return (
      this.abstractGoverningBodyLocationName ||
      this.governingBodyLocationName ||
      'Ontbrekende bestuurseenheid'
    );
  }
}
