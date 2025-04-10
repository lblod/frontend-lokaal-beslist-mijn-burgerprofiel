import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface ArgsInterface {
  loading: boolean;
  iconOpen: string;
  iconClosed: string;
  defaultOpen: boolean;
  skin: string;
  reverse: boolean;
}

export default class Accordion extends Component<ArgsInterface> {
  get defaultOpen() {
    return this.args.defaultOpen ?? false;
  }

  @tracked isOpen = this.defaultOpen;

  get loading() {
    if (this.args.loading) return 'is-loading';
    else return '';
  }

  get iconOpen() {
    if (this.args.iconOpen) {
      return this.args.iconOpen;
    } else {
      return 'nav-down';
    }
  }

  get iconClosed() {
    if (this.args.iconClosed) {
      return this.args.iconClosed;
    } else {
      return 'nav-right';
    }
  }

  get skin() {
    if (this.args.skin == 'border') return 'au-c-accordion--border';
    return '';
  }

  get reverse() {
    if (this.args.reverse) return 'au-c-accordion--reverse';
    return '';
  }

  @action
  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }
}
