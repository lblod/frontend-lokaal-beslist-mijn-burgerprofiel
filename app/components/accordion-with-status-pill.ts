import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export interface AccordionWithStatusPillSignature {
  // The arguments accepted by the component
  Args: {
    loading: boolean;
    iconOpen: string;
    iconClosed: string;
    skin: string;
  };
}

export default class AccordionWithStatusPill extends Component<AccordionWithStatusPillSignature> {
  @tracked isOpen = false;

  get loading() {
    if (this.args.loading) return 'is-loading';
    else return '';
  }

  get iconOpen() {
    if (this.args.iconOpen) {
      return this.args.iconOpen;
    } else {
      return 'nav-up';
    }
  }

  get iconClosed() {
    if (this.args.iconClosed) {
      return this.args.iconClosed;
    } else {
      return 'nav-down';
    }
  }

  @action
  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }
}
