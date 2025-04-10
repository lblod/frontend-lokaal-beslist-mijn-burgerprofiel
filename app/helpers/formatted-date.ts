import { helper } from '@ember/component/helper';
import { lightFormat } from 'date-fns';

export function formattedDate([date]: [Date]): string {
  return date ? lightFormat(date, 'dd/MM/yyyy') : '';
}

export default helper(formattedDate);
