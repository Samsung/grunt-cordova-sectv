var path = require('path');

module.exports = function(grunt) {
    grunt.registerMultiTask('sectv-package', 'package sectv apps', function() {
        var platformName = this.target;
        var wwwSrc = path.normalize(this.data.src || ('./www'));
        var dest = this.data.dest || path.join('platforms', platformName, 'build');
        var platformRepos = this.data.platformRepos || ('../cordova-sectv-' + platformName);
        var packager = require('./packager/'+platformName);
        var done = this.async();
        packager.package(function () {
            done();
        }, function () {
            done();
        }, wwwSrc, dest, platformRepos);
    });
};