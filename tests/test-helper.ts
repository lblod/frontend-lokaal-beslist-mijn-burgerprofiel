import Application from 'frontend-burgernabije-besluitendatabank/app';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';

setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
loadTests();
start();
