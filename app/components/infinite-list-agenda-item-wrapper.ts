import Component from '@glimmer/component';
import { service } from '@ember/service';
import type ItemsService from 'frontend-burgernabije-besluitendatabank/services/items-service';

export default class InfiniteListAgendaItemWrapper extends Component {
  @service declare itemsService: ItemsService;
}
