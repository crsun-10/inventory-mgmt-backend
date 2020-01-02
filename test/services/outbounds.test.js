const assert = require('assert');
const app = require('../../src/app');

describe('\'outbounds\' service', () => {
  it('registered the service', () => {
    const service = app.service('outbounds');

    assert.ok(service, 'Registered the service');
  });
});
