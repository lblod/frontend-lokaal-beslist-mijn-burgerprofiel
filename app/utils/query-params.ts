const SEPARATOR = '+';

export function serializeArray(array: string[]): string {
  return array.join(SEPARATOR);
}

export function deserializeArray(arrayString: string): string[] {
  return arrayString.split(SEPARATOR);
}
