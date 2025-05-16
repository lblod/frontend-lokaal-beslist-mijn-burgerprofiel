import { action } from '@ember/object';
import FilterComponent, { type FilterArgs } from './filter';

type GroupedOptions = {
  groupName: string;
  option: string;
};

type UnifiedOptions = string | GroupedOptions;
interface Signature {
  Args: {
    options: Promise<UnifiedOptions[]>;
    selected: string;
    updateSelected: (selected?: string) => void;
  } & FilterArgs;
}

export default class SelectRadioButtonFilterComponent extends FilterComponent<Signature> {
  get selected() {
    if (this.args.selected) {
      return this.args.selected;
    }

    if (this.args.options && this.args.options.length >= 1) {
      return this.args.options[0];
    }

    return null;
  }

  @action
  async selectChange(selectedOption: string) {
    this.args.updateSelected(selectedOption);
    this.updateQueryParams({
      [this.args.queryParam]: selectedOption,
    });
  }
}
