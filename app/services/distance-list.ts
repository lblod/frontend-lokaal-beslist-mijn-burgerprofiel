import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type FilterService from './filter-service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';

export interface DistanceOption {
  id: string;
  label: string;
  value: number | null;
}

export default class DistanceListService extends Service {
  @service declare store: Store;
  @service declare filterService: FilterService;
  @service declare router: RouterService;

  @tracked selected?: DistanceOption | null;
  @tracked options: DistanceOption[] = [
    {
      id: '1',
      label: '< 3 km',
      value: 3,
    },
    {
      id: '2',
      label: '< 5 km',
      value: 5,
    },
    {
      id: '3',
      label: '< 10 km',
      value: 10,
    },
    {
      id: '4',
      label: '< 15 km',
      value: 15,
    },
    {
      id: '5',
      label: '< 25 km',
      value: 25,
    },
    {
      id: '6',
      label: '< 50 km',
      value: 50,
    },
  ]; // This data will be replaced with a query to the API

  async loadOptions() {
    if (this.filterService.filters.distance) {
      this.selected = this.options.find(
        (option) =>
          option.id ===
          this.router.currentRoute.queryParams[QueryParameterKeys.distance],
      );
    }
    return this.options;
  }

  getSelectedDistance(id?: string): DistanceOption | undefined {
    if (!id || id.trim() === '') {
      return undefined;
    }
    return this.options.find((option) => option.id === id);
  }
}

declare module '@ember/service' {
  interface Registry {
    'distance-list': DistanceListService;
  }
}
