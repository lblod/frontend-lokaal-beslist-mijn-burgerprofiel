import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { click, fillIn, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | filters/date-range-filter', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await render(hbs`<Filters::DateRangeFilter />`);
  });

  const toggleButtonSelector = async () =>
    await find('[data-test-filters-toggle-button]');

  test('it displays presets by default', async function (assert) {
    assert
      .dom(this.element)
      .hasText('Selecteer een periode Alle periodes Eigen periode kiezen');
  });

  test('it switches between presets and custom date range when click the toggle button', async function (assert) {
    assert.expect(2);

    let toggleButton = await toggleButtonSelector();
    await click(toggleButton);

    assert.deepEqual(toggleButton.textContent.trim(), 'Eigen periode kiezen');

    toggleButton = await toggleButtonSelector();
    await click(toggleButton);

    assert.deepEqual(toggleButton.textContent.trim(), 'Bestaande periodes');
  });

  module('when custom date range is selected', function (hooks) {
    hooks.beforeEach(async function () {
      await click(await toggleButtonSelector());
      this.router = this.owner.lookup('service:router');
      this.router.transitionTo = sinon.stub();
    });

    const dateRangeFilterFromSelector = async () =>
      await find('[data-test-date-range-filter-from]');

    const dateRangeFilterToSelector = async () =>
      await find('[data-test-date-range-filter-to]');

    test('it updates queryParams when date valide ', async function (assert) {
      assert.expect(2);

      await fillIn(await dateRangeFilterFromSelector(), '2023-01-01');

      assert.true(this.router.transitionTo.calledOnce);
      assert.deepEqual(this.router.transitionTo.getCall(0).args, [
        {
          queryParams: {
            end: null,
            start: '2023-01-01',
          },
        },
      ]);
    });

    test('it updates queryParams when date is cleared', async function (assert) {
      assert.expect(3);

      await fillIn(await dateRangeFilterFromSelector(), '2023-01-01');
      await fillIn(await dateRangeFilterFromSelector(), '');

      assert.true(this.router.transitionTo.calledTwice);
      assert.deepEqual(this.router.transitionTo.getCall(0).args[0], {
        queryParams: {
          end: null,
          start: '2023-01-01',
        },
      });
      assert.deepEqual(this.router.transitionTo.getCall(1).args[0], {
        queryParams: {
          end: null,
          start: null,
        },
      });
    });

    test('it displays error when from date is before 2015', async function (assert) {
      assert.expect(2);

      await fillIn(await dateRangeFilterFromSelector(), '2014-12-31');
      await fillIn(await dateRangeFilterToSelector(), '2014-12-31');

      assert
        .dom(
          '[data-test-date-range-filter-from-error="De startdatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();

      assert
        .dom(
          '[data-test-date-range-filter-to-error="De einddatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();
    });

    test('it displays error when to date is after 2100', async function (assert) {
      assert.expect(2);

      await fillIn(await dateRangeFilterFromSelector(), '2101-01-01');
      await fillIn(await dateRangeFilterToSelector(), '2101-01-01');

      assert
        .dom(
          '[data-test-date-range-filter-from-error="De startdatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();

      assert
        .dom(
          '[data-test-date-range-filter-to-error="De einddatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();
    });

    test('it displays error when from date is after to date', async function (assert) {
      assert.expect(3);

      await fillIn(await dateRangeFilterFromSelector(), '2023-12-31');
      await fillIn(await dateRangeFilterToSelector(), '2023-01-01');

      assert
        .dom(
          '[data-test-date-range-filter-to-error="De startdatum moet voor de einddatum liggen"]',
        )
        .exists();

      assert.true(this.router.transitionTo.calledOnce);
      assert.deepEqual(this.router.transitionTo.getCall(0).args, [
        {
          queryParams: {
            end: null,
            start: '2023-12-31',
          },
        },
      ]);
    });
  });
});
