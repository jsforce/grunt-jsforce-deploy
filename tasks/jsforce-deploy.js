/**
 *
 */
var jsforce = require('jsforce');

module.exports = function(grunt) {
  'use strict';

  var archiver = require('archiver');

  grunt.registerMultiTask('jsforce_deploy', 'Deploy force.com package to Salesforce', function() {
    var done = this.async();
    var options = this.options();
    var data = this.data;
    var config = {};
    if ((!options.username || !options.password) && (!options.accessToken || !options.instanceUrl)) {
       grunt.log.error('Credential to salesforce server is not found in options.');
       grunt.log.error('Specify "username" and "password" in options config in grunt task.');
       return done(false);
    }
    "loginUrl,accessToken,instanceUrl,refreshToken,clientId,clientSecret,redirectUri,logLevel".split(',').forEach(function(prop) {
      if (options[prop]) { config[prop] = options[prop]; }
    });
    var conn = new jsforce.Connection(config);
    (
      options.username && options.password ?
      conn.login(options.username, options.password).then(function() { return conn.identity(); }) :
      conn.identity()
    )
    .then(function(identity) {
      grunt.log.writeln('Logged in as : ' + identity.username);
      grunt.log.writeln('Deploying to Server ...');
      var archive = archiver('zip');
      archive.bulk(data);
      archive.finalize();
      conn.metadata.pollTimeout = options.pollTimeout || 60*1000; // timeout in 60 sec by default
      conn.metadata.pollInterval = options.pollInterval || 5*1000; // polling interval to 5 sec by default
      return conn.metadata.deploy(archive).complete({ details: true });
    })
    .then(function(res) {
      if (res.status === 'Failed') {
        grunt.log.error('Deploy failed.');
        if (res.details && res.details.componentFailures) {
          reportFailures(res.details);
        }
        done(false);
      } else {
        grunt.log.ok('Deploy successful.');
        done();
      }
    })
    .then(null, function(err) {
      grunt.log.error('Deploy failed.');
      grunt.log.error(err);
      done(false);
    });
  });

  function reportFailures(details) {
    var failures = details.componentFailures;
    if (!failures) { return; }
    if (!failures.length) { failures = [ failures ]; }
    failures.forEach(function(f) {
      grunt.log.error(' - ' + f.problemType + ' on ' + f.fileName + ' : ' + f.problem);
    });
  }

};