import Model, { attr } from '@ember-data/model';

export default class GoverningBodyClasssificationCodeModel extends Model {
  @attr('string') declare label: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'governing-body-classification-code': GoverningBodyClasssificationCodeModel;
  }
}
