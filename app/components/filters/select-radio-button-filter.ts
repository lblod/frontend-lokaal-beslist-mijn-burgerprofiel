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
    return this.args.selected;
  }

  @action
  async selectChange(selectedOption: string) {
    this.args.updateSelected(selectedOption);
    this.updateQueryParams({
      [this.args.queryParam]: selectedOption,
    });
  }
}
