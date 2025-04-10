import { setupTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | municipality-list', function (hooks) {
  setupTest(hooks);

  this.subject = function () {
    return this.owner.lookup('service:municipality-list');
  };

  let queryStub;
  hooks.beforeEach(function () {
    queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
    queryStub
      .withArgs('location', {
        page: { size: 600 },
        filter: {
          niveau: 'Gemeente',
        },
        sort: ':no-case:label',
      })
      .resolves([
        {
          id: 'e60532b5e10070b48664b998e12af31cd4e612a0b8d089804d0bbed3d4ecc969',
          label: 'Aalst',
        },
        {
          id: '7a7daa48e9e6449358cf96be6c7b30466648d31236e56b8958fae7d53e2308b8',
          label: 'Aalter',
        },
        {
          id: 'a0e4508a-a20b-42e5-a40d-4d919d045fdd',
          label: 'Aalter',
        },
        {
          id: '9398188baec8d653dec67da8687d5a3fec3868ca3e068306a79c6d72e5c88b19',
          label: 'Kruishoutem',
        },
      ]);
  });

  hooks.afterEach(function () {
    queryStub.restore();
  });

  test('it fetches municipalities', async function (assert) {
    const service = this.subject();
    const municipalities = await service.municipalities();

    assert.strictEqual(municipalities.length, 4);
  });

  test('it deduplicates municipalities label and filter out `Kruishoutem`', async function (assert) {
    const service = this.subject();
    const municipalityLabels = await service.municipalityLabels();

    assert.deepEqual(municipalityLabels, [
      {
        label: 'Aalst',
        type: 'gemeentes',
      },
      {
        label: 'Aalter',
        type: 'gemeentes',
      },
    ]);
  });

  test('it returns all ids for a duplicate label', async function (assert) {
    const service = this.subject();
    const ids = await service.getLocationIdsFromLabels('Aalter');

    assert.deepEqual(ids, [
      '7a7daa48e9e6449358cf96be6c7b30466648d31236e56b8958fae7d53e2308b8',
      'a0e4508a-a20b-42e5-a40d-4d919d045fdd',
    ]);
  });
});
