import { formatNumber } from 'frontend-burgernabije-besluitendatabank/helpers/format-number';
import { module, test } from 'qunit';

module('Unit | Helper | format-number', function () {
  test('it formats whole numbers correctly', function (assert) {
    assert.strictEqual(
      formatNumber([3118248]),
      '3.118.248,00',
      'Formats large numbers with dot separators and two decimals',
    );
  });

  test('it formats numbers with decimals', function (assert) {
    assert.strictEqual(
      formatNumber([1000.5]),
      '1.000,50',
      'Formats decimals correctly',
    );
    assert.strictEqual(
      formatNumber([1234.567, 3]),
      '1.234,567',
      'Handles custom decimal places',
    );
    assert.strictEqual(
      formatNumber([1234.567, 1]),
      '1.234,6',
      'Rounds correctly to 1 decimal place',
    );
  });

  test('it handles string inputs with commas', function (assert) {
    assert.strictEqual(
      formatNumber(['3,118,248']),
      '3.118.248,00',
      'Handles string input with commas',
    );
    assert.strictEqual(
      formatNumber(['1,234.567']),
      '1.234,57',
      'Handles decimal string input with commas',
    );
  });

  test('it handles invalid inputs', function (assert) {
    assert.strictEqual(
      formatNumber(['abc']),
      'Invalid number',
      'Returns "Invalid number" for non-numeric values',
    );
    assert.strictEqual(
      formatNumber(['']),
      'Invalid number',
      'Handles empty strings correctly',
    );
  });

  test('it formats numbers with zero decimal places', function (assert) {
    assert.strictEqual(
      formatNumber([5000, 0]),
      '5.000',
      'Formats number with zero decimal places',
    );
  });
});
