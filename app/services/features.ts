import Service from '@ember/service';
import { assert } from '@ember/debug';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';

export default class FeaturesService extends Service {
  static PREFIX = 'feature-';
  #features: Record<string, boolean> = {};

  constructor() {
    super();
    const queryParams = this.#getQueryParams();
    if (queryParams.get('clear-feature-overrides') === 'true') {
      this.#clearCookieFeatures();
    }

    const configFeatures = this.#getConfigFeatures();
    const cookieFeatures = this.#getCookieFeatures();
    const queryFeatures = this.#getQueryParamsFeatures(queryParams);
    this.setup({
      ...configFeatures,
      ...cookieFeatures,
      ...queryFeatures,
    });

    // save query params in cookie
    if (Object.keys(queryFeatures).length > 0) {
      this.#setCookieFeatures(queryFeatures);
    }
  }

  setup(features: Record<string, boolean>) {
    this.#features = { ...features };
    console.log('Feature flags:', this.#features);
  }

  isEnabled(feature: string): boolean {
    assert(
      `The "${feature}" feature is not defined. Make sure the feature is defined in the "features" object in the config/environment.js file and that there are no typos in the name.`,
      feature in this.#features,
    );

    return this.#features[feature] ?? false;
  }

  #getConfigFeatures(): Record<string, boolean> {
    const configFeatures: Record<string, boolean> = Object.fromEntries(
      Object.entries(config.features).map(([featureName, value]) => {
        return [featureName, value === 'true' || value === true];
      }),
    );

    return configFeatures;
  }

  // cookie has to start with 'feature-{{feature-name}}'
  #getCookieFeatures(): Record<string, boolean> {
    const cookieFeatures: Record<string, boolean> = {};
    const cookies = document.cookie.split('; ');

    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      const featureName = this.#extractFeatureNameFromKey(key);
      if (featureName) {
        cookieFeatures[featureName] = value === 'true';
      }
    }

    return cookieFeatures;
  }

  #setCookieFeatures(features: Record<string, boolean>) {
    for (const [featureName, featureValue] of Object.entries(features)) {
      document.cookie = `${FeaturesService.PREFIX}${featureName}=${featureValue}; path=/`;
    }
  }

  #clearCookieFeatures() {
    const featuresToClear = Object.keys(this.#getCookieFeatures());
    for (const featureName of featuresToClear) {
      document.cookie = `${FeaturesService.PREFIX}${featureName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }

  #getQueryParams(): URLSearchParams {
    const queryString = window.location.search.substring(1);
    return new URLSearchParams(queryString);
  }

  //query param has to start with 'feature-{{feature-name}}'
  #getQueryParamsFeatures(
    queryParams: URLSearchParams,
  ): Record<string, boolean> {
    const queryFeatures: Record<string, boolean> = {};

    for (const [key, value] of queryParams.entries()) {
      const featureName = this.#extractFeatureNameFromKey(key);
      if (featureName) {
        queryFeatures[featureName] = value === 'true';
      }
    }

    return queryFeatures;
  }

  #extractFeatureNameFromKey(key?: string): string | null {
    if (key?.startsWith(FeaturesService.PREFIX)) {
      return key.replace(FeaturesService.PREFIX, '');
    }
    return null;
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:feature')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('feature') declare altName: FeatureService;`.
declare module '@ember/service' {
  interface Registry {
    features: FeaturesService;
  }
}
