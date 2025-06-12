import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import FilterComponent from '../filter';
import type AddressService from 'frontend-burgernabije-besluitendatabank/services/address';
import { createLocationQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/location-query';
import { tracked } from '@glimmer/tracking';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type { Address } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';
import type DistanceListService from 'frontend-burgernabije-besluitendatabank/services/distance-list';

export default class AddressRegisterSelectorComponent extends FilterComponent {
  @service declare address: AddressService;
  @service declare filterService: FilterService;
  @service declare itemsService: ItemsService;
  @service declare distanceList: DistanceListService;
  @tracked addressSuggestion: Address[] = [];

  selectSuggestion = task(async (addressSuggestion) => {
    this.address.selectedAddress = addressSuggestion;
    this.filterService.updateFilters({
      street: addressSuggestion?.fullAddress,
    });
    this.itemsService.loadAgendaItems.perform(0, false);
    this.updateQueryParams({
      [QueryParameterKeys.street]: addressSuggestion
        ? addressSuggestion?.fullAddress
        : undefined,
    });
    if (!this.distanceList.selected) {
      this.distanceList.selected =
        this.distanceList.options[this.distanceList.options.length - 1];
      this.updateQueryParams({
        [QueryParameterKeys.distance]: this.distanceList.selected?.id,
      });
    }
  });

  handleKeydown = task({ restartable: true }, async (text: string) => {
    await timeout(400);
    if (text.length > 0) {
      this.addressSuggestion = await createLocationQuery(text);
      return this.addressSuggestion;
    }
  });
}
