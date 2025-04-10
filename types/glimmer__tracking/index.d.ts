import '@glimmer/tracking';

// @glimmer/tracking is a special package in Ember. The types come from the package, but the implementation comes from Ember.
// At the moment there is a difference between the two. Ember's version exports the `@cached` decorator, but the real package doesn't.
// As a workaround we add the types for `@cached` locally. Source: https://github.com/ember-polyfills/ember-cached-decorator-polyfill/blob/08000987b6ef57cd562d65392caff10a8a2432d3/index.d.ts
// We can supposedly remove this when switching to the official Ember types (or when updating to @glimmer/tracking v2 when it comes out).
declare module '@glimmer/tracking' {
  /**
   * @decorator
   *
   * Memoizes the result of a getter based on autotracking.
   *
   * The `@cached` decorator can be used on native getters to memoize their return
   * values based on the tracked state they consume while being calculated.
   *
   * By default a getter is always re-computed every time it is accessed. On
   * average this is faster than caching every getter result by default.
   *
   * However, there are absolutely cases where getters are expensive, and their
   * values are used repeatedly, so memoization would be very helpful.
   * Strategic, opt-in memoization is a useful tool that helps developers
   * optimize their apps when relevant, without adding extra overhead unless
   * necessary.
   *
   * @example
   *
   * ```ts
   * import { tracked, cached } from '@glimmer/tracking';
   *
   * class Person {
   *   @tracked firstName = 'Jen';
   *   @tracked lastName = 'Weber';
   *
   *   @cached
   *   get fullName() {
   *     return `${this.firstName} ${this.lastName}`;
   *   }
   * }
   * ```
   */
  export let cached: PropertyDecorator;
}
