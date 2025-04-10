import JSONAPISerializer from '@ember-data/serializer/json-api';
import type Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { type ModelSchema } from 'ember-data';
import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';

type Resolution = {
  attributes?: {
    motivation?: string;
    value?: string;
  };
};

export default class ResolutionSerializer extends JSONAPISerializer {
  private normilizeResolution(resolution: Resolution) {
    return {
      ...resolution,
      ...(resolution.attributes && {
        attributes: {
          ...resolution.attributes,
          motivation: cleanString(resolution.attributes.motivation),
          value: cleanString(resolution.attributes.value),
        },
      }),
    };
  }

  normalizeResponse(
    store: Store,
    primaryModelClass: ModelSchema,
    payload: { data?: Resolution | Array<Resolution> },
    id: string | number,
    requestType: string,
  ) {
    if (Array.isArray(payload.data)) {
      payload.data = payload.data.map((item) => this.normilizeResolution(item));
    } else if (payload.data) {
      payload.data = this.normilizeResolution(payload.data);
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
