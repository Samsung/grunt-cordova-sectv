module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
            },
            src: ['www/**/*.js']
        },
        clean: ['platforms/sectv-orsay/www/**/*' , 'platforms/sectv-orsay/build/*' , 'platforms/sectv-tizen/www/**/*' , 'platforms/sectv-tizen/build/*'],
        'sectv-build': {
            'orsay': {
                dest: 'platforms/sectv-orsay/www',
                platformRepos: '../cordova-sectv-orsay',
                scripts: {
                    'cordova.js': '../cordova-js/pkg/cordova.sectv-orsay.js',
                    'toast.js': '../cordova-plugin-toast/platform_www/sectv-orsay/toast.js'
                }
            },
            'tizen': {
                dest: 'platforms/sectv-tizen/www',
                platformRepos: '../cordova-sectv-tizen',
                scripts: {
                    'cordova.js': '../cordova-js/pkg/cordova.sectv-tizen.js',
                    'toast.js': '../cordova-plugin-toast/platform_www/sectv-tizen/toast.js'
                }
            }
        },
        'sectv-package': {
            'orsay': {
                build: 'platforms/sectv-orsay/www',
                dest: 'platforms/sectv-orsay/build'
            },
            'tizen': {
                build: 'platforms/sectv-tizen/www',
                dest: 'platforms/sectv-tizen/build',
                sdbSrc: 'c:/tizen-tv-sdk/tools'
            }
        }
    });

    // external tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // custom tasks
    grunt.loadNpmTasks('grunt-cordova-sectv');

    // defaults
    grunt.registerTask('default', ['jshint', 'clean', 'sectv-build', 'sectv-package']);
};
