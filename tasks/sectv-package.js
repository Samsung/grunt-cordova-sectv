var path = require('path');

module.exports = function(grunt) {
    grunt.registerMultiTask('sectv-package', 'package sectv apps', function() {
        var platformName = this.target;
        var build = this.data.build || path.join('platforms', platformName, 'www');
        var dest = this.data.dest || path.join('platforms', platformName, 'build');
        var sdbSrc = this.data.sdbSrc;
        var packager = require('./packager/'+platformName);
        var done = this.async();
        packager.package(function () {
            done();
        }, function () {
            done();
        }, build, dest, sdbSrc);
    });
};