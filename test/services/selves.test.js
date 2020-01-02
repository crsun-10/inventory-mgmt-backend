const assert = require('assert');
const app = require('../../src/app');

describe('\'selves\' service', () => {
  it('registered the service', () => {
    const service = app.service('selves');

    assert.ok(service, 'Registered the service');
  });
});
