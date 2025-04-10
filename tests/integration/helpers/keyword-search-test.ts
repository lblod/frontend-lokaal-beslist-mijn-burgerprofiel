import { keywordSearch } from 'frontend-burgernabije-besluitendatabank/helpers/keyword-search';
import { module, test } from 'qunit';

module('Unit | Helper | keyword-search', function () {
  test('it correctly parses a simple OR query', function (assert) {
    const result = keywordSearch(['hello OR world']);
    assert.deepEqual(
      result,
      { or: ['hello', 'world'] },
      'Parses OR operator correctly',
    );
  });

  test('it correctly parses a NOT query', function (assert) {
    const result = keywordSearch(['hello NOT world']);
    assert.deepEqual(
      result,
      { not: ['world'], or: ['hello'] },
      'Parses NOT operator correctly',
    );
  });

  test('it correctly parses a MUST query', function (assert) {
    const result = keywordSearch(['MUST "important term"']);
    assert.deepEqual(
      result,
      { must: ['important term'] },
      'Parses MUST operator correctly',
    );
  });

  test('it handles mixed operators correctly', function (assert) {
    const result = keywordSearch(['hello OR world NOT test MUST "important"']);
    assert.deepEqual(
      result,
      {
        or: ['hello', 'world'],
        not: ['test'],
        must: ['important'],
      },
      'Handles mixed operators correctly',
    );
  });

  test('it returns null for an invalid query', function (assert) {
    const result = keywordSearch(['random text without operators']);
    assert.strictEqual(
      result,
      null,
      'Returns null for a query without recognized operators',
    );
  });
});
