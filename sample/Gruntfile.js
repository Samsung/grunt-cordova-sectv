'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
            },
            src: ['www/**/*.js']
        },
        clean: ['platforms/sectv-orsay/www/**/*' , 'platforms/sectv-orsay/build/*' , 'platforms/sectv-tizen/www/**/*' , 'platforms/sectv-tizen/build/*'],
        'sectv-prepare': {
            'sectv-orsay': {
                dest: 'platforms/sectv-orsay/www',
                platformRepos: '../cordova-sectv-orsay',
                scripts: {
                    'cordova.js': '../cordova-js/pkg/cordova.sectv-orsay.js',
                    'toast.js': '../cordova-plugin-toast/platform_www/sectv-orsay/toast.js'
                }
            },
            'sectv-tizen': {
                dest: 'platforms/sectv-tizen/www',
                platformRepos: '../cordova-sectv-tizen',
                scripts: {
                    'cordova.js': '../cordova-js/pkg/cordova.sectv-tizen.js',
                    'toast.js': '../cordova-plugin-toast/platform_www/sectv-tizen/toast.js'
                }
            },
            'tv-webos': {
                dest: 'platforms/tv-webos/www',
                platformRepos: '../cordova-tv-webos',
                scripts: {
                    'cordova.js': '../cordova-js/pkg/cordova.tv-webos.js',
                    'toast.js': '../cordova-plugin-toast/platform_www/tv-webos/toast.js'
                }
            }
        },
        'sectv-build': {
            'sectv-orsay': {
                www: 'platforms/sectv-orsay/www',
                dest: 'platforms/sectv-orsay/build'
            },
            'sectv-tizen': {
                profilePath: '/home/TizenSDK/.metadata/.plugins/org.tizen.common.sign/profiles.xml',
                profileName: 'myprofile',
                www: 'platforms/sectv-tizen/www',
                dest: 'platforms/sectv-tizen/build'
            },
            'tv-webos': {
                www: 'platforms/tv-webos/www',
                dest: 'platforms/tv-webos/build'
            }
        }
    });

    // external tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // custom tasks
    grunt.loadNpmTasks('grunt-cordova-sectv');

    // defaults
    grunt.registerTask('default', ['jshint', 'clean', 'sectv-prepare', 'sectv-build']);
};
