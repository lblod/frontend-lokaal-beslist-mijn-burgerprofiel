const SEPARATOR = '+';

export function serializeArray(array: string[], separator = SEPARATOR): string {
  return array.join(separator);
}

export function deserializeArray(
  arrayString: string | null,
  separator = SEPARATOR,
): string[] {
  if (!arrayString) {
    return [];
  }

  return arrayString.split(separator);
}
