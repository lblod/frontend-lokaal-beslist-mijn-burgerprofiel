// There is an open PR with types but I couldn't get it to work so I went with a less strict version:
// https://github.com/tracked-tools/tracked-toolbox/pull/23
declare module 'tracked-toolbox' {
  /**
   * Creates a local copy of a remote value. The local copy can be updated
   * locally, but will also update if the remote value ever changes.
   *
   * @param memo The path to a "remote" property to track.
   * @param initializer This will be used if the remote value is `undefined`. If
   *   the initializer is a function, it will be called and its return value will
   *   be used as the default value.
   */
  export function localCopy<T = unknown>(
    memo: string,
    initializer?: T | (() => T),
  ): PropertyDecorator;
}
