import { helper } from '@ember/component/helper';
import { getFormattedDate } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date';

export function formattedDate([date]: [Date]): string {
  return getFormattedDate(date);
}

export default helper(formattedDate);
