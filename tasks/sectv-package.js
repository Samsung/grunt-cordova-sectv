'use strict';

var path = require('path');

module.exports = function(grunt) {
    grunt.registerMultiTask('sectv-package', 'package sectv apps', function() {
        var platformName = this.target;

        var packager = require('./packager/'+platformName);
        var done = this.async();
        packager.package(function () {
            done();
        }, function () {
            done();
        }, this.data);
    });
};