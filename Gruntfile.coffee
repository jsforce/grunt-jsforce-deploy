fs = require "fs"

module.exports = (grunt) ->

  grunt.initConfig
    jsforce_deploy:
      test:
        expand: true
        cwd: "test/"
        src: [ "pkg/**" ]
      options:
        username: process.env.SF_USERNAME
        password: process.env.SF_PASSWORD
#        loginUrl: "https://test.salesforce.com"
#        logLevel: 'DEBUG'
#        pollInterval: 10*1000
#        pollTimeout: 120*1000

  grunt.loadTasks "tasks"

  # create test static files with random content
  grunt.registerTask "build", "Build test static files", ->
    data = "Random: " + Math.random()
    fs.writeFileSync "test/pkg/staticresources/GruntJSforceTestResource.resource", data

  grunt.registerTask "deploy", [ "build", "jsforce_deploy" ]
  grunt.registerTask "default", [ "deploy" ]