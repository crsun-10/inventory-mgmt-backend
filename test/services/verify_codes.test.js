const assert = require('assert');
const app = require('../../src/app');

describe('\'verify_codes\' service', () => {
  it('registered the service', () => {
    const service = app.service('verify_codes');

    assert.ok(service, 'Registered the service');
  });
});
