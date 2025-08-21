import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | open-in-first-overview-embed',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<OpenInFirstOverviewEmbed />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`
      <OpenInFirstOverviewEmbed>
        template block text
      </OpenInFirstOverviewEmbed>
    `);

      assert.dom().hasText('template block text');
    });
  },
);
