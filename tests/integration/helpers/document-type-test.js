import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | document-type', function (hooks) {
  setupRenderingTest(hooks);

  test('it returns "Agenda" when URL contains "agenda"', async function (assert) {
    this.set('content', 'https://example.com/agenda/123');
    await render(hbs`{{document-type this.content}}`);

    assert.strictEqual(
      this.element.textContent?.trim(),
      'Agenda',
      'Returns Agenda for a URL containing "agenda"',
    );
  });

  test('it returns "Besluitenlijst" when URL contains "besluitenlijst"', async function (assert) {
    this.set('content', 'https://example.com/besluitenlijst/456');
    await render(hbs`{{document-type this.content}}`);

    assert.strictEqual(
      this.element.textContent?.trim(),
      'Besluitenlijst',
      'Returns Besluitenlijst for a URL containing "besluitenlijst"',
    );
  });

  test('it returns "Besluitenlijst" when URL contains "besluit"', async function (assert) {
    this.set('content', 'https://example.com/besluit/789');
    await render(hbs`{{document-type this.content}}`);

    assert.strictEqual(
      this.element.textContent?.trim(),
      'Besluitenlijst',
      'Returns Besluitenlijst for a URL containing "besluit"',
    );
  });

  test('it returns "Notule" when URL contains "notulen"', async function (assert) {
    this.set('content', 'https://example.com/notulen/101112');
    await render(hbs`{{document-type this.content}}`);

    assert.strictEqual(
      this.element.textContent?.trim(),
      'Notule',
      'Returns Notule for a URL containing "notulen"',
    );
  });

  test('it returns "Notule" when URL contains "notule"', async function (assert) {
    this.set('content', 'https://example.com/notule/131415');
    await render(hbs`{{document-type this.content}}`);

    assert.strictEqual(
      this.element.textContent?.trim(),
      'Notule',
      'Returns Notule for a URL containing "notule"',
    );
  });

  test('it returns "Onbekend Type" when URL does not contain known types', async function (assert) {
    this.set('content', 'https://example.com/other/xyz');
    await render(hbs`{{document-type this.content}}`);

    assert.strictEqual(
      this.element.textContent?.trim(),
      'Onbekend Type',
      'Returns Onbekend Type when no known type is found',
    );
  });

  test('it returns "Onbekend Type" when URL is not a string', async function (assert) {
    this.set('content', 12345);
    await render(hbs`{{document-type this.content}}`);

    assert.strictEqual(
      this.element.textContent?.trim(),
      'Onbekend Type',
      'Returns Onbekend Type when the input is not a string',
    );
  });
});
