import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

export interface AgendaItemCardSignature {
  // The arguments accepted by the component
  Args: {
    item: { id: string };
  };
  // Any blocks yielded by the component
  Blocks: {
    default: [];
  };
  // The element to which `...attributes` is applied in the component template
  Element: null;
}

export default class AgendaItemCard extends Component<AgendaItemCardSignature> {
  @service declare router: RouterService;

  @action
  goToAgendaItem() {
    this.router.transitionTo('agenda-items.agenda-item', this.args.item.id);
  }
}
