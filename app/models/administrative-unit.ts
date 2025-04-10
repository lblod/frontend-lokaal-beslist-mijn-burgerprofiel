import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import type AdministrativeUnitClassificationCodeModel from './administrative-unit-classification-code';
import type GoverningBodyModel from './governing-body';
import type LocationModel from './location';

export default class AdministrativeUnitModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende gemeente' })
  declare name: string;

  @hasMany('governing-body', { async: true, inverse: 'administrativeUnit' })
  declare governingBodies: AsyncHasMany<GoverningBodyModel>;

  @belongsTo('administrative-unit-classification-code', {
    async: true,
    inverse: null,
  })
  declare classification: AsyncBelongsTo<AdministrativeUnitClassificationCodeModel>;

  @belongsTo('location', { async: true, inverse: null })
  declare location: AsyncBelongsTo<LocationModel>;

  get locationValue() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    return (this as AdministrativeUnitModel)
      .belongsTo('location')
      ?.value() as LocationModel | null;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'administrative-unit': AdministrativeUnitModel;
  }
}
