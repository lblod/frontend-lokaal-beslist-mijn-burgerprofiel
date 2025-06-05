import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import type Session from 'frontend-burgernabije-besluitendatabank/models/mu-search/session';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import type ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';
import { createAgendaItemsQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/agenda-items-query';
import { createSessionsQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/sessions-query';
import type { MuSearchResponse } from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type { AgendaItemsParams } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import { action } from '@ember/object';
import type FilterService from './filter-service';
import type ThemeListService from './theme-list';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type DistanceListService from './distance-list';
import type AddressService from './address';

export default class ItemsService extends Service {
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare themeList: ThemeListService;
  @service declare distanceList: DistanceListService;
  @service declare muSearch: MuSearchService;
  @service declare address: AddressService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;
  @service declare filterService: FilterService;

  @tracked agendaItems: AgendaItem[] = [];
  @tracked sessions: Session[] = [];
  @tracked totalAgendaItems = 0;
  @tracked totalSessions = 0;
  @tracked currentAgendaItemPage = 0;

  currentSessionPage = 0;

  get filters() {
    return this.filterService.filters;
  }
  get total() {
    return this.totalAgendaItems + this.totalSessions;
  }

  get canLoadMoreAgendaItems() {
    return this.agendaItems.length < this.totalAgendaItems;
  }

  get canLoadMoreSessions() {
    return this.sessions.length < this.totalSessions;
  }

  get isFirstPageLoaded() {
    if (this.currentAgendaItemPage >= 1) {
      return true;
    }

    return this.currentAgendaItemPage === 0 && !this.loadAgendaItems.isRunning;
  }

  @action
  initialAgendaItems(filters: AgendaItemsParams) {
    this.filterService.filters = filters;
    this.loadAgendaItems.perform(this.currentAgendaItemPage, false);
  }
  @action
  initialSessions(filters: AgendaItemsParams) {
    this.filterService.filters = filters;
    this.loadSessions.perform(this.currentSessionPage, false);
  }

  @action
  resetAgendaItems() {
    this.currentAgendaItemPage = 0;
    this.agendaItems = [];
  }
  @action
  resetSessions() {
    this.currentSessionPage = 0;
    this.sessions = [];
  }
  @action
  async fetchLocationIds() {
    const municipalityIds =
      await this.municipalityList.getLocationIdsFromLabels(
        this.filterService.municipalityLabels,
      );
    const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
      this.filters?.provinceLabels || [],
    );
    return [...municipalityIds, ...provinceIds].join(',');
  }

  @action
  loadMoreAgendaItems() {
    this.currentAgendaItemPage++;
    this.loadAgendaItems.perform(this.currentAgendaItemPage, true);
  }

  @action
  loadMoreSessions() {
    this.currentSessionPage++;
    this.loadSessions.perform(this.currentSessionPage, true);
  }

  loadAgendaItems = task(
    { restartable: true, maxConcurrency: 1 },
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
      const agendaItems: MuSearchResponse<AgendaItem> =
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
      const filteredAgendaItems = agendaItems.items.filter(
        (item) =>
          !this.governingBodyDisabledList.disabledList.some((disabled) =>
            item.governingBodyIdResolved.includes(disabled),
          ),
      );

      this.agendaItems = loadMore
        ? [...this.agendaItems, ...filteredAgendaItems]
        : filteredAgendaItems;

      this.totalAgendaItems = agendaItems.count ?? 0;
      return this.agendaItems;
    },
  );

  loadSessions = task(
    { restartable: true },
    async (page: number, loadMore: boolean = false) => {
      if (!this.filters) return;

      const locationIds = await this.fetchLocationIds();
      const governingBodyClassificationIds = serializeArray(
        this.filters.governingBodyClassificationIds,
      );
      const sessions: MuSearchResponse<Session> = await this.muSearch.search(
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
      this.sessions = loadMore
        ? [...this.sessions, ...sessions.items]
        : sessions.items;

      this.totalSessions = sessions.count ?? 0;
      return this.sessions;
    },
  );
}
