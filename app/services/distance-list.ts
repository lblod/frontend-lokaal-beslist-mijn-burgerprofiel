import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type FilterService from './filter-service';
import type Store from '@ember-data/store';

export interface DistanceOption {
  id?: string;
  label: string;
}

export default class DistanceListService extends Service {
  @service declare store: Store;
  @service declare filterService: FilterService;

  @tracked selected?: DistanceOption;
  @tracked options: DistanceOption[] = [
    {
      id: '0',
      label: 'Alle afstanden',
    },
    {
      id: '1',
      label: '< 3 km',
    },
    {
      id: '2',
      label: '< 5 km',
    },
    {
      id: '3',
      label: '< 10 km',
    },
    {
      id: '4',
      label: '< 15 km',
    },
    {
      id: '5',
      label: '< 25 km',
    },
    {
      id: '6',
      label: '< 50 km',
    },
  ];

  constructor(...args: []) {
    super(...args);
    this.loadOptions();
  }
  async loadOptions() {
    if (this.filterService.filters.distance) {
      this.selected = this.options.find(
        (option) => option.id === this.filterService.filters.distance,
      );
    }
    return this.options;
  }
}

declare module '@ember/service' {
  interface Registry {
    'distance-list': DistanceListService;
  }
}
