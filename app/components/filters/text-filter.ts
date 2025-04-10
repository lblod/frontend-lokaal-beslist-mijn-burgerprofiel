import { action } from '@ember/object';
import { localCopy } from 'tracked-toolbox';
import FilterComponent from './filter';

export interface Signature {
  Args: {
    id: string;
    queryParam: string;
    value: string;
  };
}

export default class TextFilterComponent extends FilterComponent<Signature> {
  @localCopy<string>('args.value', '') declare value: string;

  @action
  handleChange(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
  }

  @action
  handleSubmit(event: Event) {
    event.preventDefault();

    this.updateQueryParams({
      [this.args.queryParam]: this.value,
    });
  }
}
