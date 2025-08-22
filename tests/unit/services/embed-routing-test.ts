import { module, test } from 'qunit';
import { setupTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';

module('Unit | Service | embed-routing', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:embed-routing');
    assert.ok(service);
  });
});
