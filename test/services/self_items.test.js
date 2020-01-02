const assert = require('assert');
const app = require('../../src/app');

describe('\'self_items\' service', () => {
  it('registered the service', () => {
    const service = app.service('self_items');

    assert.ok(service, 'Registered the service');
  });
});
