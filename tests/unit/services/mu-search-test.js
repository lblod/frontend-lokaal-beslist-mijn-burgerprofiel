import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';

module('Unit | Service | mu-search', function (hooks) {
  setupTest(hooks);

  this.subject = function () {
    return this.owner.lookup('service:muSearch');
  };

  let fetchStub;
  const defaultRequest = {
    index: 'agenda-items',
    page: 0,
    size: 10,
    dataMapping: (v) => v,
  };

  hooks.beforeEach(function () {
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.resolves({
      json: () =>
        Promise.resolve({
          count: 0,
          data: [],
        }),
    });
  });

  hooks.afterEach(function () {
    fetchStub.restore();
  });

  module('search', function () {
    test('it returns a promise', function (assert) {
      const muSearch = this.subject();

      assert.ok(muSearch.search(defaultRequest) instanceof Promise);
    });

    test('it returns items, count and pagination', async function (assert) {
      const muSearch = this.subject();

      const result = await muSearch.search(defaultRequest);

      assert.deepEqual(result, {
        items: [],
        count: 0,
        pagination: {
          first: {
            number: 0,
            size: 0,
          },
          last: {
            number: 0,
            size: 0,
          },
          self: {
            number: 0,
            size: 0,
          },
        },
      });
    });

    test('it returns items, with dataMapping applied', async function (assert) {
      const muSearch = this.subject();

      fetchStub.resolves({
        json: () =>
          Promise.resolve({
            count: 1,
            data: [
              {
                id: '1',
                attributes: {
                  title: 'title',
                },
              },
            ],
          }),
      });

      const result = await muSearch.search({
        ...defaultRequest,
        dataMapping: (v) => ({
          id: v.id,
          title: v.attributes.title,
        }),
      });

      assert.deepEqual(result, {
        items: [
          {
            id: '1',
            title: 'title',
          },
        ],
        count: 1,
        pagination: {
          first: {
            number: 0,
            size: 1,
          },
          last: {
            number: 0,
            size: 1,
          },
          self: {
            number: 0,
            size: 1,
          },
        },
      });
    });

    test('it returns next/prev in pagination when it exists', async function (assert) {
      const muSearch = this.subject();

      fetchStub.resolves({
        json: () =>
          Promise.resolve({
            count: 42,
            data: [],
          }),
      });

      const result = await muSearch.search({
        ...defaultRequest,
        page: 1,
      });

      assert.deepEqual(result, {
        items: [],
        count: 42,
        pagination: {
          first: {
            number: 0,
            size: 10,
          },
          last: {
            number: 4,
            size: 2,
          },
          next: {
            number: 2,
            size: 10,
          },
          prev: {
            number: 0,
            size: 10,
          },
          self: {
            number: 1,
            size: 10,
          },
        },
      });
    });

    test('it calls the correct endpoint', async function (assert) {
      const muSearch = this.subject();

      await muSearch.search(defaultRequest);

      assert.true(fetchStub.calledOnce);
      assert.deepEqual(fetchStub.getCall(0).args, [
        '/search/agenda-items/search?page[size]=10&page[number]=0',
      ]);
    });

    test('it calls the correct endpoint with filters', async function (assert) {
      const muSearch = this.subject();

      await muSearch.search({
        ...defaultRequest,
        filters: {
          ':query:session_planned_start':
            '(session_planned_start:[2023-09-01 TO *])',
          ':query:title': '_exists_:title AND _exists_:location_id',
        },
      });

      assert.true(fetchStub.calledOnce);
      assert.deepEqual(fetchStub.getCall(0).args, [
        '/search/agenda-items/search?page[size]=10&page[number]=0&filter[:query:session_planned_start]=(session_planned_start:[2023-09-01 TO *])&filter[:query:title]=_exists_:title AND _exists_:location_id',
      ]);
    });

    test('it calls the correct endpoint with sort ascending', async function (assert) {
      const muSearch = this.subject();

      await muSearch.search({
        ...defaultRequest,
        sort: 'session_planned_start',
      });

      assert.true(fetchStub.calledOnce);
      assert.deepEqual(fetchStub.getCall(0).args, [
        '/search/agenda-items/search?page[size]=10&page[number]=0&sort[session_planned_start.field]=asc',
      ]);
    });

    test('it calls the correct endpoint with sort descending', async function (assert) {
      const muSearch = this.subject();

      await muSearch.search({
        ...defaultRequest,
        sort: '-session-planned+start',
      });

      assert.true(fetchStub.calledOnce);
      assert.deepEqual(fetchStub.getCall(0).args, [
        '/search/agenda-items/search?page[size]=10&page[number]=0&sort[session-planned+start.field]=desc',
      ]);
    });
  });
});
