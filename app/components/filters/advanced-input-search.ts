import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { task, timeout } from 'ember-concurrency';

export interface FiltersAdvancedInputSearchSignature {
  Args: {
    value: string | null;
    searchOnlyOnTitle?: string | null;
    onUpdateKeyword?: (keyword: string | null, onlyOnTitle: boolean) => void;
  };
}

export default class FiltersAdvancedInputSearch extends Component<FiltersAdvancedInputSearchSignature> {
  @tracked isInfoModalOpen = false;

  updateKeyword = task(
    { restartable: true },
    async (event: { target: { value?: string } }) => {
      await timeout(250);
      this.args.onUpdateKeyword?.(
        event.target.value || null,
        this.isSearchOnTitle,
      );
    },
  );

  get isSearchOnTitle() {
    if (this.args.searchOnlyOnTitle && this.args.searchOnlyOnTitle == 'true') {
      return true;
    }
    return false;
  }

  @action
  toggleSearchOnTitle() {
    this.args.onUpdateKeyword?.(this.args.value, !this.isSearchOnTitle);
  }

  @action
  closeModal() {
    this.isInfoModalOpen = false;
  }
}
