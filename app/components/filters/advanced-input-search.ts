import Component from '@glimmer/component';

import { action } from '@ember/object';

export interface FiltersAdvancedInputSearchSignature {
  Args: {
    onUpdateKeyword?: (keyword: string | null) => void;
  };
}

export default class FiltersAdvancedInputSearch extends Component<FiltersAdvancedInputSearchSignature> {
  @action
  updateKeyword(event: { target: { value?: string } }) {
    this.args.onUpdateKeyword?.(event.target.value || null);
  }
}
