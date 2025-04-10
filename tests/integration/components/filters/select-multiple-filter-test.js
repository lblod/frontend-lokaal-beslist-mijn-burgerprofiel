import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { module, test } from 'qunit';

module(
  'Integration | Component | filters/select-multiple-filter',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(async function () {
      await render(hbs`<Filters::SelectMultipleFilter />`);
    });

    test('it displays grouped options', async function (assert) {
      const options = [
        {
          groupName: 'Group 1',
          options: [
            { label: 'Option 1', type: 'type1' },
            { label: 'Option 2', type: 'type2' },
          ],
        },
        {
          groupName: 'Group 2',
          options: [
            { label: 'Option 3', type: 'type3' },
            { label: 'Option 4', type: 'type4' },
          ],
        },
      ];
      const searchField = 'label';
      const queryParam = 'type1+type3';
      const selected = [
        { label: 'Option 1', type: 'type1' },
        { label: 'Option 3', type: 'type3' },
      ];

      this.setProperties({ options, searchField, queryParam, selected });

      // Re-render the component with the new args
      await render(hbs`
        <Filters::SelectMultipleFilter
          @options={{this.options}}
          @searchField={{this.searchField}}
          @queryParam={{this.queryParam}}
          @selected={{this.selected}}
          @updateSelected={{this.updateSelected}}
        />
      `);

      // Click on the select multiple filter
      await click('[data-test-select-multiple-filter]');

      // Check if options are displayed
      const optionLabels = findAll('.ember-power-select-option');
      assert.deepEqual(optionLabels.length, 4, 'All options are displayed');
    });

    test('it displays selected options', async function (assert) {
      const options = [
        {
          groupName: 'Group 1',
          options: [
            { label: 'Option 1', type: 'type1' },
            { label: 'Option 2', type: 'type2' },
          ],
        },
        {
          groupName: 'Group 2',
          options: [
            { label: 'Option 3', type: 'type3' },
            { label: 'Option 4', type: 'type4' },
          ],
        },
      ];
      const searchField = 'label';
      const queryParam = 'type1+type3';
      const selected = [
        { label: 'Option 1', type: 'type1' },
        { label: 'Option 3', type: 'type3' },
      ];

      this.setProperties({ options, searchField, queryParam, selected });

      // Re-render the component with the new args
      await render(hbs`
        <Filters::SelectMultipleFilter
          @options={{this.options}}
          @searchField={{this.searchField}}
          @queryParam={{this.queryParam}}
          @selected={{this.selected}}
          @updateSelected={{this.updateSelected}}
        />
      `);

      // Click on the select multiple filter
      await click('[data-test-select-multiple-filter]');

      // Check if selected options are displayed
      const selectedOptionLabels = findAll(
        '.ember-power-select-multiple-option',
      );
      assert.deepEqual(
        selectedOptionLabels.length,
        2,
        'All selected options are displayed',
      );
    });

    // if there are two options with the same label, they should both be displayed

    test('it displays options with the same label', async function (assert) {
      const options = [
        {
          groupName: 'Group 1',
          options: [
            { label: 'Option 1', type: 'type1' },
            { label: 'Option 1', type: 'type2' },
          ],
        },
      ];
      const searchField = 'label';
      const queryParam = 'type1';
      const selected = [{ label: 'Option 1', type: 'type1' }];

      this.setProperties({ options, searchField, queryParam, selected });

      // Re-render the component with the new args
      await render(hbs`
        <Filters::SelectMultipleFilter
          @options={{this.options}}
          @searchField={{this.searchField}}
          @queryParam={{this.queryParam}}
          @selected={{this.selected}}
          @updateSelected={{this.updateSelected}}
        />
      `);

      // Click on the select multiple filter
      await click('[data-test-select-multiple-filter]');

      // Check if options are displayed
      const optionLabels = findAll('.ember-power-select-option');
      assert.deepEqual(optionLabels.length, 2, 'All options are displayed');
    });
  },
);
