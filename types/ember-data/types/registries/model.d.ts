/**
 * Catch-all for ember-data.
 */
export default interface ModelRegistry {
  // Allow any for the sake of catch-all
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
