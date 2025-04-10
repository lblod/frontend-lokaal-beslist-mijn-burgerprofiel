import { sortSessions } from 'frontend-burgernabije-besluitendatabank/utils/sort-sessions';
import { module, test } from 'qunit';

module('Unit | Utility | sort-sessions', function () {
  module('sortSessions', function () {
    test('it sorts the array of objects based on priority', function (assert) {
      const source = [
        { startedAt: '2022-02-05' },
        { startedAt: '2022-01-15', municipality: 'A' },
        { municipality: 'C' },
      ];

      const sorted = [
        { startedAt: '2022-01-15', municipality: 'A' },
        { municipality: 'C' },
        { startedAt: '2022-02-05' },
      ];

      const result = source.sort(sortSessions);

      assert.deepEqual(result, sorted);
    });
  });
});
