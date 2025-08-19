import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type { FiltersAsQueryParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';
import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type ThemeListService from 'frontend-burgernabije-besluitendatabank/services/theme-list';

import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export interface AgendapuntenFiltersTopbarSignature {
  Args: {
    filters: FiltersAsQueryParams;
    onFiltersUpdated: () => void;
  };
  Element: null;
}

const PERIOD_KEY = 'periode';

export default class AgendapuntenFiltersTopbar extends Component<AgendapuntenFiltersTopbarSignature> {
  @service('item-list') declare itemsService: ItemListService;
  @service declare filterService: FilterService;
  @service declare distanceList: DistanceListService;
  @service declare address: AddressService;
  @service declare governmentList: GovernmentListService;
  @service declare themeList: ThemeListService;
  @service declare mbpEmbed: MbpEmbedService;

  get hasFilters() {
    return this.filterValues.length >= 1;
  }

  get isFiltersDisabled() {
    return !this.itemsService.isFirstPageLoaded;
  }

  get filterValues() {
    const values = this.filterKeys.map((key) =>
      this.getFormattedLabelForFilter(key),
    );

    return values.flat().filter((kv) => kv);
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
      QueryParameterKeys.provinces, // combined with the keyword gemeentes
      QueryParameterKeys.start, // this is handled as one label with end
      QueryParameterKeys.end, // this is handled as one label with start
      QueryParameterKeys.keywordSearchOnlyInTitle, // combined with the keyword label
    ];
  }

  get keyFormatMapping() {
    return {
      [QueryParameterKeys.distance]: this.createDistanceFilterLabel(),
      [PERIOD_KEY]: this.createPeriodFilterLabel(),
      [QueryParameterKeys.keyword]: this.createKeywordFilterLabel(),
      [QueryParameterKeys.municipalities]:
        this.createMunicipalityFilterLabels(),
      [QueryParameterKeys.themes]: this.createThemaFilterLabels(),
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
    const distanceValue = this.args.filters.afstand || undefined;
    const distanceOption = this.distanceList.getSelectedDistance(distanceValue);
    if (distanceOption && distanceValue) {
      return {
        key: QueryParameterKeys.distance,
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

  createKeywordFilterLabel() {
    const keyword = this.args.filters.trefwoord;
    const onlyOnTitle = this.args.filters.zoekOpTitel;

    if (onlyOnTitle && onlyOnTitle == 'true') {
      return {
        key: QueryParameterKeys.keywordSearchOnlyInTitle,
        value: `Zoek in de titel naar: ${keyword}`,
      };
    }
    return {
      key: QueryParameterKeys.keyword,
      value: `Zoek naar: ${keyword}`,
    };
  }

  createMunicipalityFilterLabels() {
    if (!this.mbpEmbed.isLoggedInAsVlaanderen) {
      return null;
    }

    const municipalityLabels = deserializeArray(
      this.args.filters.gemeentes ?? '',
    );
    const provinceLabels = deserializeArray(this.args.filters.provincies);

    const municipalities = municipalityLabels.map((label) => {
      return {
        key: QueryParameterKeys.municipalities,
        value: label,
      };
    });
    const provinces = provinceLabels.map((label) => {
      return {
        key: QueryParameterKeys.provinces,
        value: label,
      };
    });

    return [...municipalities, ...provinces];
  }

  createThemaFilterLabels() {
    const themaIds = deserializeArray(this.args.filters.thema);
    const options = this.themeList.getOptionsForIds(themaIds);
    return options.map((option) => {
      return {
        key: QueryParameterKeys.themes,
        value: option.label,
      };
    });
  }

  @action
  async removeFilter(keyValue: { key: string; value: string }) {
    const extraActionsForKey = {
      [QueryParameterKeys.street]: () => {
        this.address.selectedAddress = undefined;
        this.filterService.updateFilterFromQueryParamKey(
          QueryParameterKeys.street as keyof FiltersAsQueryParams,
          null,
        );
      },
      [QueryParameterKeys.distance]: () => {
        this.distanceList.selected = null;
        this.filterService.updateFilterFromQueryParamKey(
          QueryParameterKeys.distance as keyof FiltersAsQueryParams,
          null,
        );
      },
      [QueryParameterKeys.keywordSearchOnlyInTitle]: () => {
        this.filterService.searchOnTitleOnly(false);
      },
      ['periode']: () => {
        this.filterService.updateFilterFromQueryParamKey(
          QueryParameterKeys.start as keyof FiltersAsQueryParams,
          null,
        );
        this.filterService.updateFilterFromQueryParamKey(
          QueryParameterKeys.end as keyof FiltersAsQueryParams,
          null,
        );
      },
      [QueryParameterKeys.municipalities]: async () => {
        const asArray = deserializeArray(this.args.filters.gemeentes ?? '');
        const selected = asArray.filter((label) => label !== keyValue.value);
        this.filterService.updateFilterFromQueryParamKey(
          QueryParameterKeys.municipalities as keyof FiltersAsQueryParams,
          selected.length >= 1 ? selected : null,
        );
      },
      [QueryParameterKeys.provinces]: async () => {
        const asArray = deserializeArray(this.args.filters.provincies);
        const selected = asArray.filter((label) => label !== keyValue.value);
        this.filterService.updateFilterFromQueryParamKey(
          QueryParameterKeys.provinces as keyof FiltersAsQueryParams,
          selected.length >= 1 ? selected : null,
        );
      },
    };
    const actionFn = extraActionsForKey[keyValue.key];
    if (actionFn) {
      await Promise.all([actionFn()]);
    } else {
      this.filterService.updateFilterFromQueryParamKey(
        keyValue.key as keyof FiltersAsQueryParams,
        null,
      );
    }

    this.args.onFiltersUpdated?.();
  }
}
