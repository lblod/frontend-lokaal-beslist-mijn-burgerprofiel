import type { AsyncHasMany } from '@ember-data/model';
import Model, { attr, hasMany } from '@ember-data/model';
import type ResolutionModel from './resolution';
import type VoteModel from './vote';

export default class AgendaItemHandlingModel extends Model {
  @attr('boolean') declare public?: boolean;

  @hasMany('vote', { async: true, inverse: null })
  declare hasVotes?: AsyncHasMany<VoteModel>;

  @hasMany('resolution', { async: true, inverse: null })
  declare resolutions?: AsyncHasMany<ResolutionModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'agenda-item-handling': AgendaItemHandlingModel;
  }
}
