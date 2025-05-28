import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type FilterService from './filter-service';
import type Store from '@ember-data/store';
import type ConceptModel from 'frontend-burgernabije-besluitendatabank/models/concept';
import type { SelectOption } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';

const CONCEPT_SCHEME_ID = '37c887b0-136c-42bd-9292-355d3186efa9';

export default class ThemeListService extends Service {
  @service declare store: Store;
  @service declare filterService: FilterService;

  @tracked themes: Array<ConceptModel> = [];

  async fetchThemes() {
    const concepts = await this.store.query('concept', {
      'filter[concept-schemes][:id:]': CONCEPT_SCHEME_ID,
      include: 'concept-schemes',
      sort: ':no-case:label',
    });

    this.themes = concepts.slice();
  }

  get asOptions(): Array<SelectOption> {
    return this.themes.map((concept) => {
      return {
        id: concept.id,
        label: concept.label || concept.id,
      };
    });
  }

  getOptionsForIds(ids: Array<string>) {
    return this.asOptions.filter((option) => ids.includes(option.id));
  }
}

declare module '@ember/service' {
  interface Registry {
    'theme-list': ThemeListService;
  }
}
