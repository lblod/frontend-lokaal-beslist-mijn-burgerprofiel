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
      ?.map(([key, value]) =>
        this.getFormattedLabelForFilter(key, value as string | undefined),
      )
      .filter((kv) => kv && kv.value && kv.value !== '');
  }

  getFormattedLabelForFilter(key: string, value?: string) {
    const labelForFilter = {
      [QueryParameterKeys.municipalities]: {
        key: null,
        value: null,
      },
      [QueryParameterKeys.distance]: this.createDistanceFilterLabel(
        key,
        value as string | undefined,
      ),
    };

    if (Object.keys(labelForFilter).includes(key)) {
      return labelForFilter[key];
    }

    return {
      key,
      value: value,
    };
  }

  createDistanceFilterLabel(key: string, value?: string) {
    const distanceOption = this.distanceList.getSelectedDistance(value);
    if (distanceOption && value) {
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

  @action
  removeFilter(queryParamKey: keyof FiltersAsQueryParams) {
    this.filterService.updateFilterFromQueryParamKey(queryParamKey, null);
    this.args.onFiltersUpdated?.();
  }
}
