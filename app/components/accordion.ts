import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export interface AccordionSignature {
  Args: {
    isLoading: boolean;
    iconOpen: string;
    iconClosed: string;
    isInitiallyOpen: boolean;
  };
}

export default class Accordion extends Component<AccordionSignature> {
  @tracked isOpen = false;

  constructor(owner: unknown, args: AccordionSignature['Args']) {
    super(owner, args);
    if (this.args.isInitiallyOpen) {
      this.isOpen = true;
    }
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
