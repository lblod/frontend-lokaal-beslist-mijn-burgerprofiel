import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type FilterService from './filter-service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import { task } from 'ember-concurrency';
import { createLocationQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/location-query';
import type { Address } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';

export default class AddressService extends Service {
  @service declare store: Store;
  @service declare filterService: FilterService;
  @service declare router: RouterService;

  @tracked addressSuggestion: Address[] = [];
  @tracked selectedAddress?: Address | null;

  getSelectedAddress = task(async (fullAddress: string) => {
    if (!fullAddress) {
      return null;
    }
    this.addressSuggestion = await createLocationQuery(fullAddress);
    return (this.selectedAddress = this.addressSuggestion.find(
      (addressSuggestion) => {
        if (addressSuggestion.fullAddress === fullAddress) {
          this.selectedAddress = addressSuggestion;
          return true;
        }
        return false;
      },
    ));
  });

  setSelectedAddress(address: Address) {
    this.selectedAddress = address;
  }
}

declare module '@ember/service' {
  interface Registry {
    addressService: AddressService;
  }
}
