import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type AgendaItemRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item';
import type KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import type { ModelFrom } from '../../lib/type-utils';
import type ResolutionModel from 'frontend-burgernabije-besluitendatabank/models/resolution';
import type ArrayProxy from '@ember/array/proxy';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type NavigationService from 'frontend-burgernabije-besluitendatabank/services/navigation';

export default class AgendaItemController extends Controller {
  @service declare keywordStore: KeywordStoreService;
  @service declare mbpEmbed: MbpEmbedService;
  @service declare navigation: NavigationService;

  declare model: ModelFrom<AgendaItemRoute>;

  /** Data quality modal */
  @tracked modalOpen = false;

  get hasArticles() {
    return !!this.model.articles?.length;
  }

  get firstResolution() {
    return (
      this.model.resolutions as ArrayProxy<ResolutionModel>[] | undefined
    )?.[0];
  }

  get municipalityQuery() {
    return { gemeentes: this.model.agendaItem.session?.municipality };
  }

  get stemmingStatusPillText() {
    if (!this.model.vote) {
      return null;
    }
    return this.model.vote.secret ? 'Gesloten' : 'Openbaar';
  }

  get stemmingStatusPillIcon() {
    if (!this.model.vote) {
      return null;
    }
    return this.model.vote.secret ? 'not-visible' : 'visible';
  }

  get showMunicipality() {
    return this.mbpEmbed.isLoggedInAsVlaanderen;
  }

  showModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    if (this.modalOpen) {
      this.modalOpen = false;
    }
  };

  @action
  goToPreviousRoute() {
    this.navigation.goToPreviousRoute();
  }
}
