import Component from '@glimmer/component';

interface Signature {
  Element: HTMLInputElement;
  Args: {
    value?: string;
    onChange?: (newDate: string | null) => void;
  };
}

export default class DateInput extends Component<Signature> {
  handleChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    this.args.onChange?.(value ? value : null);
  };
}
