import type { AsyncHasMany } from '@ember-data/model';
import Model, { attr, hasMany } from '@ember-data/model';
import type ArticleModel from './article';

export default class ResolutionModel extends Model {
  @attr('string') declare title?: string;
  @attr('string') declare value?: string;
  @attr('string') declare motivation?: string;

  @hasMany('article', { async: true, inverse: null })
  declare articles: AsyncHasMany<ArticleModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    resolution: ResolutionModel;
  }
}
