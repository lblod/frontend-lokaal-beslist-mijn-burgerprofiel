import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type { FiltersAsQueryParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';

export interface AgendapuntenFiltersTopbarSignature {
  Args: {
    filters: FiltersAsQueryParams;
    onFiltersUpdated: () => void;
  };
  Element: null;
}

export default class AgendapuntenFiltersTopbar extends Component<AgendapuntenFiltersTopbarSignature> {
  @service declare itemsService: ItemsService;
  @service declare filterService: FilterService;
  @service declare distanceList: DistanceListService;

  get hasFilters() {
    return this.filterValues.length >= 1;
  }

  get filterValues() {
    return Object.entries(this.args.filters)
      ?.map(([key, value]) => {
        if (key == QueryParameterKeys.municipalities) {
          return {
            key: null,
            value: null,
          };
        }
        if (key == QueryParameterKeys.distance && value) {
          const distanceOption = this.distanceList.getSelectedDistance(value);
          if (distanceOption) {
            return {
              key,
              value: distanceOption.label,
            };
          }
          return {
            key: null,
            value: null,
          };
        }
        return {
          key,
          value: value,
        };
      })
      .filter((kv) => kv.value && kv.value !== '');
  }

  @action
  removeFilter(queryParamKey: keyof FiltersAsQueryParams) {
    this.filterService.updateFilterFromQueryParamKey(queryParamKey, null);
    this.args.onFiltersUpdated?.();
  }
}
