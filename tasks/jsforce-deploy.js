/**
 *
 */
var meta = require('jsforce-metadata-tools');
var archiver = require('archiver');

module.exports = function(grunt) {
  'use strict';

  var logger = { log: function(msg) { grunt.log.writeln(msg) } };

  grunt.registerMultiTask('jsforce_deploy', 'Deploy force.com package to Salesforce', function() {
    var done = this.async();
    var options = this.options();
    var data = this.data;

    var archive = archiver('zip');
    archive.bulk(data);
    archive.finalize();

    options.logger = logger;
    meta.deployFromZipStream(archive, options)
      .then(function(res) {
        meta.reportDeployResult(res, logger, options.verbose);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

};
