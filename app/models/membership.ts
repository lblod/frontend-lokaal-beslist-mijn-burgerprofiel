import Model, { type AsyncBelongsTo, belongsTo } from '@ember-data/model';
import type ParliamentaryGroupModel from './parliamentary-group';

export default class MembershipModel extends Model {
  @belongsTo('parliamentary-group', { async: true, inverse: null })
  declare innerGroup: AsyncBelongsTo<ParliamentaryGroupModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    membership: MembershipModel;
  }
}
