import type { AsyncHasMany } from '@ember-data/model';
import Model, { attr, hasMany } from '@ember-data/model';
import type MandataryModel from './mandatary';

export default class VoteModel extends Model {
  @attr('number') declare numberOfAbstentions: number;
  @attr('number') declare numberOfOpponents: number;
  @attr('number') declare numberOfProponents: number;
  @attr('boolean') declare secret: boolean;
  @attr declare subject: string;
  @attr declare consequence: string;

  @hasMany('mandatary', { async: true, inverse: null })
  declare hasAbstainers: AsyncHasMany<MandataryModel>;

  @hasMany('mandatary', { async: true, inverse: null })
  declare hasOpponents: AsyncHasMany<MandataryModel>;

  @hasMany('mandatary', { async: true, inverse: null })
  declare hasProponents: AsyncHasMany<MandataryModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    vote: VoteModel;
  }
}
