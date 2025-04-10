import { helper } from '@ember/component/helper';

export default helper(function lowerCase([value]: [
  string | null | undefined,
]): string {
  return value?.toLowerCase() ?? '';
});
