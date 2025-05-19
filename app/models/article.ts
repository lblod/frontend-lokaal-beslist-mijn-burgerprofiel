import type { AsyncBelongsTo } from '@ember-data/model';
import Model, { attr, belongsTo } from '@ember-data/model';
import type ResolutionModel from './resolution';

export default class ArticleModel extends Model {
  @attr('string') declare number?: string;
  @attr('string') declare value?: string;

  @belongsTo('resolution', { async: true, inverse: null })
  declare resolution?: AsyncBelongsTo<ResolutionModel>;

  get numberAsInt(): number {
    const matches = this.number?.match(/\d+/);
    if (!matches || matches?.length === 0) {
      // 99 is a magic number, this for when sorting it puts the item at the end
      return 99;
    }

    return parseInt(matches[0]);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    article: ArticleModel;
  }
}
