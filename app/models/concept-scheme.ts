import Model, { attr, hasMany, type AsyncBelongsTo } from '@ember-data/model';

export default class ConceptSchemeModel extends Model {
  @attr uri?: string;
  @attr label?: string;

  @hasMany('concept', { inverse: null, async: true })
  declare concepts: AsyncBelongsTo<ConceptSchemeModel>;
  @hasMany('concept', { inverse: null, async: true })
  declare topConcepts: AsyncBelongsTo<ConceptSchemeModel>;
}
