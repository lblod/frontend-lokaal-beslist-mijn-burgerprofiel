import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Component | accordion', function (hooks) {
  setupRenderingTest(hooks);

  test('it should show the content when defaultOpen is true', async function (assert) {
    this.set('defaultOpen', true);
    await render(hbs`<Accordion @defaultOpen={{this.defaultOpen}} >
      <h1>Accordion content</h1>
    </Accordion>`);

    assert.dom('h1').exists();
  });

  test('it should not show the content when defaultOpen is false', async function (assert) {
    this.set('defaultOpen', false);
    await render(hbs`<Accordion @defaultOpen={{this.defaultOpen}} >
      <h1>Accordion content</h1>
    </Accordion>`);

    assert.dom('h1').doesNotExist();
  });
});
