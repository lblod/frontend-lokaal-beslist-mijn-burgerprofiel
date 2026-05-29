import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import type ArticleModel from './article';
import type ConceptModel from './concept';
import type PlaceModel from './place';

export default class ResolutionModel extends Model {
  @attr('string') declare title?: string;
  @attr('string') declare value?: string;
  @attr('string') declare motivation?: string;

  @hasMany('article', { async: true, inverse: null })
  declare articles: AsyncHasMany<ArticleModel>;

  @hasMany('concept', { async: true, inverse: null })
  declare hasThemes?: AsyncHasMany<ConceptModel>;

  @belongsTo('place', { async: true, inverse: null })
  declare hasLocation?: AsyncBelongsTo<PlaceModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    resolution: ResolutionModel;
  }
}
