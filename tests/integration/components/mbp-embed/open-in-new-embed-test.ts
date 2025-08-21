import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | mbp-embed/open-in-new-embed',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<MbpEmbed::OpenInNewEmbed />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`
      <MbpEmbed::OpenInNewEmbed>
        template block text
      </MbpEmbed::OpenInNewEmbed>
    `);

      assert.dom().hasText('template block text');
    });
  },
);
