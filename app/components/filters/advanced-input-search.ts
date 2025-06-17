import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export interface FiltersAdvancedInputSearchSignature {
  Args: {
    onUpdateKeyword?: (keyword: string | null) => void;
  };
}

export default class FiltersAdvancedInputSearch extends Component<FiltersAdvancedInputSearchSignature> {
  @tracked isInfoModalOpen = false;

  @action
  updateKeyword(event: { target: { value?: string } }) {
    this.args.onUpdateKeyword?.(event.target.value || null);
  }

  @action
  closeModal() {
    this.isInfoModalOpen = false;
  }
}
