import { helper } from '@ember/component/helper';

export function formatNumber([value, decimalPlaces = 2]: [
  string | number,
  number?,
]): string {
  if (typeof value === 'string') {
    value = parseFloat(value.replace(/,/g, ''));
  }

  if (isNaN(value)) {
    return 'Invalid number';
  }

  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

export default helper(formatNumber);
