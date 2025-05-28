import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import FilterComponent from '../filter';
export default class AddressRegisterSelectorComponent extends FilterComponent {
  @service addressRegister;
  @service store;

  @tracked addressSuggestion;
  @tracked selectedAddress;
  @tracked addressWithBusNumber;
  @tracked addressesWithBusNumbers;

  constructor() {
    super(...arguments);

    this.addressRegister.setup({ endpoint: '/adresses-register' });
    const address = this.getQueryParam(QueryParameterKeys.street);
    this.getSelectedAddress.perform(address);
  }

  getSelectedAddress = task(async (address) => {
    this.addressSuggestion = await this.addressRegister.suggest(address);

    this.selectedAddress = this.addressSuggestion.find((addressSuggestion) => {
      if (addressSuggestion.fullAddress === address) {
        this.addressSuggestion = addressSuggestion;
        this.selectedAddress = addressSuggestion;
        return true;
      }
      return false;
    });
  });

  selectSuggestion = task(async (addressSuggestion) => {
    this.selectedAddress = await addressSuggestion;

    this.updateQueryParams({
      [QueryParameterKeys.street]: addressSuggestion
        ? addressSuggestion.fullAddress
        : undefined,
    });
  });

  handleKeydown = task({ restartable: true }, async (text) => {
    await timeout(400);

    if (text.length > 0) {
      this.addressSuggestion = await this.addressRegister.suggest(text);
      return this.addressSuggestion;
    }
  });

  @action
  handleAddressChange(data) {
    const addresses = data?.addresses;

    this.selectedAddress = null;
    this.addressWithBusNumber = null;
    this.addressesWithBusNumbers = null;
    this.resetAddressAttributes();

    if (addresses) {
      let hasBusNumberData = addresses.length > 1;
      let firstAddress = addresses[0];
      this.selectedAddress = firstAddress;

      if (hasBusNumberData) {
        this.addressesWithBusNumbers = addresses;
        this.handleBusNumberChange(firstAddress);
      } else {
        this.updateAddressAttributes(firstAddress);
      }
    }
  }

  @action
  handleBusNumberChange(address) {
    this.addressWithBusNumber = address;
    this.updateAddressAttributes(address);
  }

  updateAddressAttributes(address) {
    this.args.address.setProperties({
      straatnaam: address.street,
      huisnummer: address.housenumber,
      busnummer: address.busNumber,
      postbus: address.zipCode,
      gemeentenaam: address.municipality,
      land: address.country,
      lat: address.lat,
      lon: address.lon,
    });
  }

  resetAddressAttributes() {
    this.args.address.setProperties({
      straatnaam: null,
      huisnummer: null,
      busnummer: null,
      postbus: null,
      gemeentenaam: null,
      land: null,
      lat: null,
      lon: null,
    });
  }
}
