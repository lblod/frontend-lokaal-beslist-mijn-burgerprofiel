import Controller from '@ember/controller';
import type Store from '@ember-data/store';
import { service } from '@ember/service';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';
import type AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import { tracked } from '@glimmer/tracking';
export default class SessionsSessionController extends Controller {
  @service declare store: Store;
  queryParams = ['gemeentes', 'bestuursorganen'];

  @tracked bestuursorganen: string | null = null;
  @tracked gemeentes: string | null = null;

  declare model: {
    classificationLabel: string;
    session: SessionModel;
    agendaItems: {
      isFinished: boolean;
      isRunning: boolean;
      value: AgendaItemModel[];
    };
    otherSessions: {
      isFinished: boolean;
      isRunning: boolean;
      value: SessionModel[];
    };
    governingBodies: {
      isFinished: boolean;
      isRunning: boolean;
      value: GoverningBodyModel[];
    };
  };

  get agendaItems() {
    return this.model?.agendaItems.isFinished
      ? this.model?.agendaItems.value
      : [];
  }

  get governingBodies() {
    return this.model?.governingBodies.isFinished
      ? this.model?.governingBodies.value
      : [];
  }
  get otherSessions() {
    return this.model?.otherSessions.isFinished
      ? this.model?.otherSessions.value
      : [];
  }

  get municipalityQuery() {
    return {
      gemeentes: this.model.session.municipality,
    };
  }
  get govBodyQuery() {
    return {
      gemeentes: this.model.session.municipality,
      bestuursorganen: this.model.classificationLabel,
    };
  }
}
