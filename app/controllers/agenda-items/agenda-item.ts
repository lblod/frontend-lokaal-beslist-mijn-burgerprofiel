import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type AgendaItemRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item';
import type KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import type { ModelFrom } from '../../lib/type-utils';
import type ResolutionModel from 'frontend-burgernabije-besluitendatabank/models/resolution';
import type ArrayProxy from '@ember/array/proxy';

export default class AgendaItemController extends Controller {
  @service declare keywordStore: KeywordStoreService;
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

  showModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    if (this.modalOpen) {
      this.modalOpen = false;
    }
  };
}
