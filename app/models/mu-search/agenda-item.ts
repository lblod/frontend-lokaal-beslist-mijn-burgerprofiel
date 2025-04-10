import { getFormattedDate } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date';
import { getFormattedDateRange } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date-range';

export default class AgendaItemModel {
  declare id?: string;
  declare locationId?: string;
  declare abstractGoverningBodyLocationName?: string;
  declare governingBodyLocationName?: string;
  declare abstractGoverningBodyId: string[];
  declare governingBodyId: string[];
  declare abstractGoverningBodyName?: string;
  declare governingBodyName?: string;
  declare abstractGoverningBodyClassificationName?: string;
  declare governingBodyClassificationName?: string;
  declare sessionPlannedStart?: Date;
  declare sessionStartedAt?: Date;
  declare sessionEndedAt?: Date;
  declare title?: string;
  declare description?: string;
  declare resolutionTitle?: string;

  get dateFormatted() {
    if (this.sessionStartedAt || this.sessionEndedAt) {
      return getFormattedDateRange(this.sessionStartedAt, this.sessionEndedAt);
    }
    if (this.sessionPlannedStart) {
      return 'Gepland op ' + getFormattedDate(this.sessionPlannedStart);
    }

    return 'Geen Datum';
  }
  get governingBodyClassificationNameResolved() {
    return (
      this.abstractGoverningBodyClassificationName ||
      this.governingBodyClassificationName ||
      'Ontbrekend bestuursorgaan'
    );
  }

  get governingBodyIdResolved() {
    return [...this.governingBodyId, ...this.abstractGoverningBodyId];
  }

  get titleResolved() {
    return this.title || this.resolutionTitle || 'Ontbrekende titel';
  }

  get municipality() {
    return (
      this.abstractGoverningBodyLocationName ||
      this.governingBodyLocationName ||
      'Ontbrekende bestuurseenheid'
    );
  }
}
