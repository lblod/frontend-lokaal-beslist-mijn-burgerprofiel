import Component from '@glimmer/component';

import { service } from '@ember/service';

import type ItemListService from 'frontend-burgernabije-besluitendatabank/services/item-list';

export default class InfiniteListAgendaItemWrapper extends Component {
  @service('item-list') declare itemsService: ItemListService;
}
