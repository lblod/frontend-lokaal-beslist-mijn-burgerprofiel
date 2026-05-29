import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type GeometryModel from './geometry';

/**
 * A physical place / venue (locn:Location), e.g. "Kinepolis Gent".
 * Linked from a resolution via prov:atLocation. This is distinct from the
 * `location` model (prov:Location werkingsgebied).
 */
export default class PlaceModel extends Model {
  @attr uri?: string;
  @attr('string') declare label?: string;

  @belongsTo('geometry', { async: true, inverse: null })
  declare geometry?: AsyncBelongsTo<GeometryModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    place: PlaceModel;
  }
}
