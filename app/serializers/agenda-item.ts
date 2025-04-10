import JSONAPISerializer from '@ember-data/serializer/json-api';
import type Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { ModelSchema } from 'ember-data';
import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';

type AgendaItem = {
  attributes?: {
    title?: string;
    description?: string;
  };
};

export default class AgendaItemSerializer extends JSONAPISerializer {
  private normilizeAgendaItem(agendaItem: AgendaItem) {
    return {
      ...agendaItem,
      ...(agendaItem.attributes && {
        attributes: {
          ...agendaItem.attributes,
          title: cleanString(agendaItem.attributes.title),
          description: cleanString(agendaItem.attributes.description),
        },
      }),
    };
  }

  normalizeResponse(
    store: Store,
    primaryModelClass: ModelSchema,
    payload: { data?: AgendaItem | AgendaItem[] },
    id: string | number,
    requestType: string,
  ) {
    if (Array.isArray(payload.data)) {
      payload.data = payload.data.map((item) => this.normilizeAgendaItem(item));
    } else if (payload.data) {
      payload.data = this.normilizeAgendaItem(payload.data);
    }

    return super.normalizeResponse(
      store,
      primaryModelClass,
      payload,
      id,
      requestType,
    );
  }
}
