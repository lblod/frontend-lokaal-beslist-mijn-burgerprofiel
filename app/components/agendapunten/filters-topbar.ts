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

const PERIOD_KEY = 'periode';

export default class AgendapuntenFiltersTopbar extends Component<AgendapuntenFiltersTopbarSignature> {
  @service declare itemsService: ItemsService;
  @service declare filterService: FilterService;
  @service declare distanceList: DistanceListService;

  get hasFilters() {
    return this.filterValues.length >= 1;
  }

  get filterValues() {
    return this.filterKeys
      .map((key) => this.getFormattedLabelForFilter(key))
      .filter((kv) => kv);
  }

  get filterKeys() {
    const keysOfFilters = Object.keys(this.args.filters);
    const keysWithValue = keysOfFilters.filter((key) => {
      const filterValue = this.args.filters[key as keyof FiltersAsQueryParams];
      if (!filterValue || filterValue.trim?.() === '') {
        return false;
      }

      if (this.hiddenFilterKeys.includes(key)) {
        return false;
      }

      return true;
    });
    if (
      keysOfFilters.includes(QueryParameterKeys.start || QueryParameterKeys.end)
    ) {
      keysWithValue.push(PERIOD_KEY);
    }

    return keysWithValue;
  }

  get hiddenFilterKeys() {
    return [
      QueryParameterKeys.municipalities,
      QueryParameterKeys.provinces,
      QueryParameterKeys.start, // this is handled as one label with end
      QueryParameterKeys.end, // this is handled as one label with start
    ];
  }

  get keyFormatMapping() {
    return {
      [QueryParameterKeys.distance]: this.createDistanceFilterLabel(),
      [PERIOD_KEY]: this.createPeriodFilterLabel(),
    };
  }

  getFormattedLabelForFilter(key: string) {
    if (Object.keys(this.keyFormatMapping).includes(key)) {
      return this.keyFormatMapping[key];
    }
    const value = this.args.filters[key as keyof FiltersAsQueryParams];
    if (!value) {
      return null;
    }

    return {
      key,
      value: value,
    };
  }

  createDistanceFilterLabel() {
    const key = QueryParameterKeys.distance;
    const distanceValue = this.args.filters.afstand || undefined;
    const distanceOption = this.distanceList.getSelectedDistance(distanceValue);
    if (distanceOption && distanceValue) {
      return {
        key,
        value: distanceOption.label,
      };
    }
    return null;
  }

  createPeriodFilterLabel() {
    const start = this.args.filters.begin;
    const end = this.args.filters.eind;

    if (start && end) {
      return {
        key: PERIOD_KEY,
        value: `Van ${start} tot ${end}`,
      };
    } else if (start) {
      return {
        key: QueryParameterKeys.start,
        value: `Van ${start}`,
      };
    } else if (end) {
      return {
        key: QueryParameterKeys.end,
        value: `Tot ${end}`,
      };
    }
  }

  @action
  removeFilter(queryParamKey: string) {
    if (queryParamKey === 'periode') {
      this.filterService.updateFilterFromQueryParamKey(
        QueryParameterKeys.start as keyof FiltersAsQueryParams,
        null,
      );
      this.filterService.updateFilterFromQueryParamKey(
        QueryParameterKeys.end as keyof FiltersAsQueryParams,
        null,
      );
    } else {
      this.filterService.updateFilterFromQueryParamKey(
        queryParamKey as keyof FiltersAsQueryParams,
        null,
      );
    }

    this.args.onFiltersUpdated?.();
  }
}
