import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | agendapunten/filters-topbar',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Agendapunten::FiltersTopbar />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`
      <Agendapunten::FiltersTopbar>
        template block text
      </Agendapunten::FiltersTopbar>
    `);

      assert.dom().hasText('template block text');
    });
  },
);
