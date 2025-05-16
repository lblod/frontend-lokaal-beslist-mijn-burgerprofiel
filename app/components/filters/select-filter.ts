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
    updateSelected: (selected?: string | { label: string; id: string }) => void;
  } & FilterArgs;
}

export default class SelectFilterComponent extends FilterComponent<Signature> {
  get selected() {
    return this.args.selected;
  }

  @action
  async selectChange(
    selectedOption: string | { label: string; id: string } | null,
  ) {
    let value: string | undefined;

    if (selectedOption == null) {
      value = undefined;
    } else if (typeof selectedOption === 'string') {
      value = selectedOption;
    } else {
      value = selectedOption.id;
    }

    this.args.updateSelected(selectedOption ?? undefined);
    return this.updateQueryParams({
      [this.args.queryParam]: value,
    });
  }
}
