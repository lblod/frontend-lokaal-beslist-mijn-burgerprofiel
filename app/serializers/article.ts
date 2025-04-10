import JSONAPISerializer from '@ember-data/serializer/json-api';
import type Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { ModelSchema } from 'ember-data';
import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';

type Article = {
  attributes?: {
    value?: string;
  };
};

export default class ArticleSerializer extends JSONAPISerializer {
  private normilizeArticle(article: Article) {
    return {
      ...article,
      ...(article.attributes && {
        attributes: {
          ...article.attributes,
          value: cleanString(article.attributes.value),
        },
      }),
    };
  }

  normalizeResponse(
    store: Store,
    primaryModelClass: ModelSchema,
    payload: { data?: Article | Array<Article> },
    id: string | number,
    requestType: string,
  ) {
    if (Array.isArray(payload.data)) {
      payload.data = payload.data.map((item) => this.normilizeArticle(item));
    } else if (payload.data) {
      payload.data = this.normilizeArticle(payload.data);
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
