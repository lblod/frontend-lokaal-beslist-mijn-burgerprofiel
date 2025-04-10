import JSONAPIAdapter from '@ember-data/adapter/json-api';
import type { Snapshot } from '@ember-data/store';
import type Store from '@ember-data/store';

export default class VoteAdapter extends JSONAPIAdapter {
  findHasMany(
    store: Store,
    snapshot: Snapshot,
    url: string,
    relationship: { key: string },
  ) {
    // add page size 100 when relationship is voters
    if (
      ['hasProponents', 'hasOpponents', 'hasAbstainers'].includes(
        relationship?.key,
      )
    ) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}page[size]=100`;
    }

    return super.findHasMany(store, snapshot, url, relationship);
  }
}
