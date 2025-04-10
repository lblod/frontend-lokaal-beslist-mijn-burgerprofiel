import { module, test } from 'qunit';
import { getFormattedDateRange } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date-range';

module('Unit | Utility | get-formatted-date-range', function () {
  test('returns empty string when date are missing', function (assert) {
    const result = getFormattedDateRange();

    assert.strictEqual(result, '');
  });

  test('returns simple date when start and end are equals', function (assert) {
    const result = getFormattedDateRange(
      new Date('2020-12-21'),
      new Date('2020-12-21'),
    );

    assert.strictEqual(result, '21/12/2020');
  });

  test('returns formatted date range when start and end are different', function (assert) {
    const result = getFormattedDateRange(
      new Date('2020-12-21'),
      new Date('2020-12-22'),
    );

    assert.strictEqual(result, '21/12/2020 tot 22/12/2020');
  });
});
