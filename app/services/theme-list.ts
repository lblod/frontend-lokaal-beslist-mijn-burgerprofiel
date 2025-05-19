import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type FilterService from './filter-service';
import type Store from '@ember-data/store';

export interface ThemeOption {
  id?: string;
  label: string;
  type: string;
}

const CONCEPT_SCHEME_ID = '37c887b0-136c-42bd-9292-355d3186efa9';

export default class ThemeListService extends Service {
  @service declare store: Store;
  @service declare filterService: FilterService;

  @tracked selected: ThemeOption[] = [];
  @tracked options: ThemeOption[] = [];

  async loadOptions() {
    const sortedConcepts = await this.store.query('concept', {
      'filter[concept-schemes][:id:]': CONCEPT_SCHEME_ID,
      include: 'concept-schemes',
      sort: ':no-case:label',
      page: { size: 100 },
    });

    this.options = sortedConcepts.slice();
    if (this.filterService.filters.themes) {
      const splitThemes = this.filterService.filters.themes.split('+');
      this.selected = this.options.filter((option) =>
        splitThemes.includes(option.label),
      );
    }
    return this.options;
  }
  get selectedIds() {
    return this.selected.map((option) => option.id).join(',');
  }
}

declare module '@ember/service' {
  interface Registry {
    'theme-list': ThemeListService;
  }
}
