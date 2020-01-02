const assert = require('assert');
const app = require('../../src/app');

describe('\'unverified_items\' service', () => {
  it('registered the service', () => {
    const service = app.service('unverified_items');

    assert.ok(service, 'Registered the service');
  });
});
