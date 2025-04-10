import Model, { attr } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr('string') declare familyName: string;
  @attr('string') declare firstNameUsed: string;
  @attr('string') declare alternatieveNaam: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    person: PersonModel;
  }
}
