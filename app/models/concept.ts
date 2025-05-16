import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type ConceptSchemeModel from './concept-scheme';

export default class ConceptModel extends Model {
  @attr uri?: string;
  @attr label?: string;

  @hasMany('concept-scheme', { inverse: null, async: true })
  declare conceptSchemes: AsyncHasMany<ConceptSchemeModel>;
  @hasMany('concept-scheme', { inverse: null, async: true })
  declare topConceptSchemes: AsyncHasMany<ConceptSchemeModel>;
}
