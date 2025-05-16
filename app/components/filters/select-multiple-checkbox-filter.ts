import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import FilterComponent, { type FilterArgs } from './filter';

type Option = Record<string, string>;

type GroupedOptions = {
  groupName: string;
  options: Option[];
};

type UnifiedOptions = Option | GroupedOptions;

interface Signature {
  Args: {
    options: Promise<UnifiedOptions[]>;
    selected: Option[];
    updateSelected: (selected: Option[]) => void;
  } & FilterArgs;
}

export default class SelectMultipleCheckboxFilterComponent extends FilterComponent<Signature> {
  @service declare router: RouterService;

  get selected() {
    return this.args.selected;
  }

  @action
  onSelectedChange(newOptions: Option[]) {
    this.args.updateSelected(newOptions);
  }

  @action
  async selectChange(selectedOptions: Option[]) {
    this.onSelectedChange(selectedOptions);

    const emptyQueryParams: Record<string, string | undefined> =
      deserializeArray(this.args.queryParam).reduce((acc, value) => {
        return {
          ...acc,
          [value]: undefined,
        };
      }, {});

    const queryParams = selectedOptions.reduce((acc, { label, type }) => {
      return {
        ...acc,
        ...(type && { [type]: acc[type] ? `${acc[type]}+${label}` : label }),
      };
    }, emptyQueryParams);

    this.updateQueryParams(queryParams);
  }
}
