import Model, { attr } from '@ember-data/model';

/**
 * A geometry (locn:Geometry). `coordinates` holds the WKT literal, e.g.
 * "SRID=31370;POINT(105218.36 192475.16)" (Belgian Lambert 72).
 */
export default class GeometryModel extends Model {
  @attr uri?: string;
  @attr('string') declare coordinates?: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    geometry: GeometryModel;
  }
}
