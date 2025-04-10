import Controller from '@ember/controller';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';

export default class DataQualityController extends Controller {
  @service declare municipalityList: MunicipalityListService;
  @service declare router: RouterService;
  @tracked currentlyLoading = false;

  @tracked loading = false;
  @tracked selectedMunicipality: { label: string; id: string } | null = null;

  get municipalities() {
    return this.municipalityList.municipalities();
  }

  @action resetLoading() {
    this.loading = false;
  }

  @action handleMunicipalityChange(selectedMunicipality: {
    label: string;
    id: string;
  }) {
    this.selectedMunicipality = selectedMunicipality;
    this.router.transitionTo('data-quality', {
      queryParams: {
        gemeentes: selectedMunicipality ? selectedMunicipality.label : '',
      },
    });
  }
}
