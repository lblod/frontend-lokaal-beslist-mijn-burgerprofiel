'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'frontend-burgernabije-besluitendatabank',
    environment,
    rootURL: '/',
    locationType: 'none', // If updated to hash, change ember-plausible config
    EmberENV: {
      EXTEND_PROTOTYPES: false,
    },
    'ember-plausible': {
      enabled: false, // We enable this manually when the config is provided by the server
    },
    plausible: {
      apiHost: '{{PLAUSIBLE_APIHOST}}',
      domain: '{{PLAUSIBLE_DOMAIN}}',
    },
    APP: {
      MBP_CLIENT_ID: '{{MBP_CLIENT_ID}}',
    },
    features: {
      // define feature flags here
      'statistics-page-feature': false,
    },
    'governing-body-disabled': '{{GOVERNING_BODY_DISABLED_LIST}}',
  };

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
