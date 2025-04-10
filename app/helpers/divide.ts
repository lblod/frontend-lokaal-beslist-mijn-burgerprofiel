import { helper } from '@ember/component/helper';

export default helper(function divide(positional: number[]) {
  if (positional.length === 0) {
    return 0;
  }

  const result = positional.reduce((a, b) => a / b);
  return result;
});
