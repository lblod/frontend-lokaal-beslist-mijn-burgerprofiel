import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | is-pdf-url', function (hooks) {
  setupRenderingTest(hooks);

  test('it detects a valid URL', async function (assert) {
    this.set('content', 'https://www.example.com/file.pdf');
    await render(hbs`{{if (is-pdf-url this.content) 'Valid' 'Invalid'}}`);

    assert.strictEqual(this.element.textContent?.trim(), 'Valid');
  });

  test('it detects an invalid URL', async function (assert) {
    this.set('content', 'not-a-url');
    await render(hbs`{{if (is-pdf-url this.content) 'Valid' 'Invalid'}}`);

    assert.strictEqual(this.element.textContent?.trim(), 'Invalid');
  });
});
