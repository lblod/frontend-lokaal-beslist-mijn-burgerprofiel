import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | mbp-embed/reset-embed-history-and-open-link',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<MbpEmbed::ResetEmbedHistoryAndOpenLink />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`
      <MbpEmbed::ResetEmbedHistoryAndOpenLink>
        template block text
      </MbpEmbed::ResetEmbedHistoryAndOpenLink>
    `);

      assert.dom().hasText('template block text');
    });
  },
);
