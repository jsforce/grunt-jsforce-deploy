/* global process, describe, it, Buffer, __dirname */
var fs = require('fs');
var jsforce = require('jsforce');
var assert = require('power-assert');

/**
 *
 */
describe('jsforce-deploy', function() {
  this.timeout(20000);

  it("should match deployed static file's content to the local one", function() {
    var conn = new jsforce.Connection();
    return conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD)
    .then(function() {
      return conn.identity();
    })
    .then(function(identity) {
      return conn.metadata.read('StaticResource', 'GruntJSforceTestResource');
    })
    .then(function(res) {
      var data = fs.readFileSync(__dirname + '/pkg/staticresources/GruntJSforceTestResource.resource', 'utf8');
      assert(new Buffer(res.content, 'base64').toString('utf8') === data);
    });
  });

});