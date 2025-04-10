import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';
import { module, test } from 'qunit';

module('Unit | Utility | clean-string', function () {
  test('it removes whitespace from both ends', function (assert) {
    assert.strictEqual(cleanString('   Test OK  '), 'Test OK');
  });

  test('it removes newline from both ends', function (assert) {
    assert.strictEqual(cleanString(' \n  Test \nOK  \n'), 'Test \nOK');
  });

  test('it removes comma from both ends', function (assert) {
    assert.strictEqual(cleanString(' , ,  Test, OK  ,'), 'Test, OK');
  });

  test('it returns empty string when only bad content', function (assert) {
    assert.strictEqual(cleanString('\n\n\n, , , , , , , , , '), '');
  });
});
