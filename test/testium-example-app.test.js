'use strict';
var assert = require('assertive');

var testiumExampleApp = require('../');

describe('testium-example-app', function () {
  it('is empty', function () {
    assert.deepEqual({}, testiumExampleApp);
  });
});
