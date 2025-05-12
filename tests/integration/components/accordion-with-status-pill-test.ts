import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | accordion-with-status-pill',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<AccordionWithStatusPill />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`
      <AccordionWithStatusPill>
        template block text
      </AccordionWithStatusPill>
    `);

      assert.dom().hasText('template block text');
    });
  },
);
