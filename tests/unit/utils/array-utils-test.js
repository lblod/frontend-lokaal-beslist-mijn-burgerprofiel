import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';
import { module, test } from 'qunit';

module('Unit | Utility | array-utils', function () {
  module('sortObjectsByTitle', function () {
    test('it sorts the array of objects based on the title property', function (assert) {
      const source = [
        { title: '10. Apple' },
        { title: 'Banana 10' },
        { title: 'Orange' },
        { title: '3. Apple' },
        { title: 'Banana 2' },
      ];

      const sorted = [
        { title: '3. Apple' },
        { title: '10. Apple' },
        { title: 'Banana 2' },
        { title: 'Banana 10' },
        { title: 'Orange' },
      ];

      const result = source.sort(sortObjectsByTitle);

      assert.deepEqual(result, sorted);
    });
  });
});
