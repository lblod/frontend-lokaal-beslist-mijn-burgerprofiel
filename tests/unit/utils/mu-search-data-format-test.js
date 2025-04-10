import { module, test } from 'qunit';
import {
  parseMuSearchAttributeToDate,
  parseMuSearchAttributeToString,
} from 'frontend-burgernabije-besluitendatabank/utils/mu-search-data-format';

module('Unit | Utility | mu-search-data-format', function () {
  module('parseMuSearchAttributeToDate', function () {
    test('it returns a Date when input string is valid', function (assert) {
      assert.deepEqual(
        parseMuSearchAttributeToDate('2022-11-29T20:00:00+01:00'),
        new Date('2022-11-29T20:00:00+01:00'),
      );
    });

    test('it returns the first date when input is an array of strings', function (assert) {
      assert.deepEqual(
        parseMuSearchAttributeToDate([
          '2023-01-26T19:35:00+01:00',
          '2022-11-29T20:00:00+01:00',
        ]),
        new Date('2023-01-26T19:35:00+01:00'),
      );
    });

    test('it returns undefined when no input', function (assert) {
      assert.deepEqual(parseMuSearchAttributeToDate(), undefined);
    });

    test('it returns undefined when wrong string', function (assert) {
      assert.deepEqual(parseMuSearchAttributeToDate('wrong-string'), undefined);
    });
  });

  module('parseMuSearchAttributeToString', function () {
    test('it returns a string when input is a string', function (assert) {
      assert.deepEqual(parseMuSearchAttributeToString('test'), 'test');
    });

    test('it returns the first string when input is an array of strings', function (assert) {
      assert.deepEqual(
        parseMuSearchAttributeToString(['test', 'test2']),
        'test',
      );
    });

    test('it returns undefined when no input', function (assert) {
      assert.deepEqual(parseMuSearchAttributeToString(), undefined);
    });
  });
});
