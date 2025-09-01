import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import type AdministrativeUnitModel from './administrative-unit';
import type GoverningBodyClassificationCodeModel from './governing-body-classification-code';
import type SessionModel from './session';

/**
 * There are two types of governing bodies
 *
 * 1. The abstraction (undated)
 * 2. With the time that they are active specified
 *
 * That time is called a time-specialization (tijdspecialisatie),
 * which is defined {@link https://themis.vlaanderen.be/docs/catalogs here (see 2.2.2.2)}
 * as "the governing period where a *governing body*
 * is appointed through direct elections"
 *
 * You can view the mandatendatabank specification
 * on Vlaanderen.be {@link https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank here}
 *
 */
export default class GoverningBodyModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende naam' }) declare name: string;

  @belongsTo('administrative-unit', {
    async: true,
    inverse: 'governingBodies',
  })
  declare administrativeUnit: AsyncBelongsTo<AdministrativeUnitModel>;

  get administrativeUnitValue() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    return (this as GoverningBodyModel)
      .belongsTo('administrativeUnit')
      ?.value() as AdministrativeUnitModel | null;
  }

  @belongsTo('governing-body-classification-code', {
    async: true,
    inverse: 'governingBodies',
  })
  declare classification: AsyncBelongsTo<GoverningBodyClassificationCodeModel>;

  @hasMany('session', { async: true, inverse: 'governingBody' })
  declare sessions: AsyncHasMany<SessionModel>;

  @belongsTo('governing-body', {
    async: true,
    inverse: 'hasTimeSpecializations',
  })
  declare isTimeSpecializationOf: AsyncBelongsTo<GoverningBodyModel>;

  @hasMany('governing-body', {
    async: true,
    inverse: 'isTimeSpecializationOf',
  })
  declare hasTimeSpecializations: AsyncHasMany<GoverningBodyModel>;

  get isTimeSpecializationOfValue() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    return (this as GoverningBodyModel)
      .belongsTo('isTimeSpecializationOf')
      ?.value() as GoverningBodyModel | null;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'governing-body': GoverningBodyModel;
  }
}
