const assert = require('assert');
const app = require('../../src/app');

describe('\'inbounds\' service', () => {
  it('registered the service', () => {
    const service = app.service('inbounds');

    assert.ok(service, 'Registered the service');
  });
});
