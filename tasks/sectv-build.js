var path = require('path');

module.exports = function(grunt) {
    grunt.registerMultiTask('sectv-build', 'build sectv apps', function() {
        var platformName = this.target;
        var wwwSrc = path.normalize(this.data.src || ('./www'));
        var dest = this.data.dest || path.join('platforms', platformName, 'www');
        var platformRepos = this.data.platformRepos || ('../cordova-sectv-' + platformName);
        var packager = require('./packager/'+platformName);
        var done = this.async();
        packager.build(function () {
            done();
        }, function () {
            done();
        }, wwwSrc, dest, platformRepos);
    });
};