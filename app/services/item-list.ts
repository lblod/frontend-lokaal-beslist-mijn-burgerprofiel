import Service, { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import type Session from 'frontend-burgernabije-besluitendatabank/models/mu-search/session';

import type MuSearchService from './mu-search';
import type FilterService from './filter-service';

import type MunicipalityListService from './municipality-list';
import type ProvinceListService from './province-list';
import type GoverningBodyListService from './governing-body-list';
import type GovernmentListService from './government-list';
import type ThemeListService from './theme-list';
import type DistanceListService from './distance-list';
import type AddressService from './address';
import type GoverningBodyDisabledList from './governing-body-disabled-list';

import { createAgendaItemsQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/agenda-items-query';
import { createSessionsQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/sessions-query';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type { AgendaItemsParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import { type MuSearchResponse } from './mu-search';

type ModelIndex = 'agenda-items' | 'session';

export default class ItemListService extends Service {
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare address: AddressService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;

  @service declare muSearch: MuSearchService;
  @service declare filterService: FilterService;

  @tracked items: Array<AgendaItem | Session> = [];
  @tracked totalItemCount = 0;

  @tracked modelIndexToFetch: ModelIndex = 'agenda-items';
  @tracked currentPage = 0;

  get filters() {
    return this.filterService.filters;
  }

  get canLoadMoreItems() {
    return this.items.length <= this.totalItemCount;
  }

  get isFirstPageLoaded() {
    if (this.currentPage >= 1) {
      return true;
    }

    return this.currentPage === 0 && !this.fetchItems.isRunning;
  }

  changeModelIndex(index: ModelIndex) {
    this.modelIndexToFetch = index;
    this.items = [];
  }

  loadFirstPage(filters: AgendaItemsParams) {
    this.filterService.filters = filters;
    this.fetchItems.perform(this.currentPage, false);
  }

  loadMoreItems() {
    this.currentPage++;
    this.fetchItems.perform(this.currentPage, true);
  }

  fetchItems = task(
    { restartable: true },
    async (page: number, loadMore = false) => {
      if (!this.filters) return;

      const locationIds = await this.fetchLocationIds();
      const themeIds = this.filterService.asQueryParams.thema;
      const distance = this.distanceList.getSelectedDistance(
        this.filterService.asQueryParams.afstand ?? '',
      );
      const address = await this.address.getSelectedAddress.perform(
        this.filterService.asQueryParams.straat ?? '',
      );

      const governingBodyClassificationIds = serializeArray(
        this.filters.governingBodyClassificationIds,
      );
      let newItems: Array<AgendaItem | Session> = [];
      if (this.modelIndexToFetch === 'agenda-items') {
        const results: MuSearchResponse<AgendaItem> =
          await this.muSearch.search(
            createAgendaItemsQuery({
              index: 'agenda-items',
              page,
              locationIds,
              themeIds,
              governingBodyClassificationIds,
              address,
              filters: { ...this.filters, distance: distance?.value ?? null },
            }),
          );
        this.totalItemCount = results.count || 0;
        newItems = results.items.filter(
          (item) =>
            !this.governingBodyDisabledList.disabledList.some((disabled) =>
              item.governingBodyIdResolved.includes(disabled),
            ),
        );
      } else if (this.modelIndexToFetch === 'session') {
        const results: MuSearchResponse<Session> = await this.muSearch.search(
          createSessionsQuery({
            index: 'sessions',
            page,
            locationIds,
            governingBodyClassificationIds,
            plannedStartMin: this.filters.plannedStartMin,
            plannedStartMax: this.filters.plannedStartMax,
            dateSort: this.filters.dateSort,
            status: this.filters.status,
            keyword: this.filters.keyword,
          }),
        );
        this.totalItemCount = results.count || 0;
        newItems = results.items;
      }

      this.items = loadMore ? [...this.items, ...newItems] : newItems;
    },
  );

  async fetchLocationIds() {
    const municipalityIds =
      await this.municipalityList.getLocationIdsFromLabels(
        this.filters.municipalityLabels,
      );
    const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
      this.filters?.provinceLabels || [],
    );
    return [...municipalityIds, ...provinceIds].join(',');
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:item-list')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('item-list') declare altName: ItemListService;`.
declare module '@ember/service' {
  interface Registry {
    'item-list': ItemListService;
  }
}
