/**
 * Type declarations for
 *    import config from 'my-app/config/environment'
 */
declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'none';
  rootURL: string;
  APP: {
    MBP_CLIENT_ID?: string;
  };
  plausible: {
    apiHost: string;
    domain: string;
  };
  features: Record<string, boolean | string>;
  'governing-body-disabled': string;
};

export default config;
