import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type FilterService from './filter-service';
import type Store from '@ember-data/store';
import { sortObjectsByLabel } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';

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

  constructor(...args: []) {
    super(...args);
    this.loadOptions();
  }

  async loadOptions() {
    const sortedConcepts = await this.store.query('concept', {
      'filter[concept-schemes][:id:]': CONCEPT_SCHEME_ID,
      include: 'concept-schemes',
      sort: 'label',
    });

    this.options = sortedConcepts.slice().sort(sortObjectsByLabel);
    if (this.filterService.filters.themes) {
      this.selected = this.options.filter((option) =>
        this.filterService.filters.themes?.includes(option.label),
      );
    }
    return this.options;
  }
  get selectedIds() {
    return this.selected.map((option) => option.id).toString();
  }
}

declare module '@ember/service' {
  interface Registry {
    'theme-list': ThemeListService;
  }
}
