// As far as I was able to find, AdapterPopulatedRecordArray has no export aside from DS
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

export interface AdapterPopulatedRecordArrayWithMeta<T>
  extends DS.AdapterPopulatedRecordArray<T> {
  meta?: {
    count?: number;
  };
}

export function getCount(items: { meta?: { count?: number } }): number | null {
  if (items.meta?.count) {
    return items.meta.count;
  } else return null;
}
