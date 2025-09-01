import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';

import type GoverningBodyModel from './governing-body';

export default class GoverningBodyClassificationCodeModel extends Model {
  @attr('string') declare label: string;

  @hasMany('governing-body', {
    async: false,
    inverse: 'classification',
    polymorphic: true,
  })
  declare governingBodies: AsyncHasMany<GoverningBodyModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'governing-body-classification-code': GoverningBodyClassificationCodeModel;
  }
}
