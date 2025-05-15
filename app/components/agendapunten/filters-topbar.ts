import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type { AgendaItemsParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';

export interface AgendapuntenFiltersTopbarSignature {
  Args: {
    filters: AgendaItemsParams;
    keysToHide: Array<keyof AgendaItemsParams>;
    onFiltersUpdated: (filters: Partial<AgendaItemsParams>) => void;
  };
  Element: null;
}

export default class AgendapuntenFiltersTopbar extends Component<AgendapuntenFiltersTopbarSignature> {
  @service declare itemsService: ItemsService;

  get hasFilters() {
    return this.filterValues.length >= 1;
  }

  get filterValues() {
    return Object.entries(this.args.filters)
      ?.map(([key, value]) => {
        return {
          key,
          value: this.args.keysToHide.includes(key as keyof AgendaItemsParams)
            ? null
            : value,
        };
      })
      .filter((kv) => kv.value && kv.value !== '');
  }

  @action
  removeFilter(filterKey: string) {
    const filters = { ...this.args.filters };
    delete filters[filterKey as keyof AgendaItemsParams];

    this.args.onFiltersUpdated?.(filters);
  }
}
