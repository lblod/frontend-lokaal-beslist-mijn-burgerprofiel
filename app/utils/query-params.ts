const SEPARATOR = '+';

export function serializeArray(array: string[]): string {
  return array.join(SEPARATOR);
}

export function deserializeArray(arrayString: string | null): string[] {
  if (!arrayString) {
    return [];
  }

  return arrayString.split(SEPARATOR);
}
