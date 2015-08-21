module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
            },
            src: ['www/**/*.js']
        },
        clean: ['platforms/sectv-orsay','platforms/sectv-tizen'],
        'sectv-build': {
            'orsay': {
                dest: 'platforms/sectv-orsay/www',
                platformRepos: '../cordova-sectv-orsay',
                scripts: {
                    'toast.js': '../cordova-plugin-toast/platform_www/sectv-orsay/toast.js'
                }
            },
            'tizen': {
                dest: 'platforms/sectv-tizen/www',
                platformRepos: '../cordova-sectv-tizen',
                scripts: {
                    'toast.js': '../cordova-plugin-toast/platform_www/sectv-tizen/toast.js'
                }
            }
        },
        'sectv-package': {
            'orsay': {
                dest: 'platforms/sectv-orsay/build'
            },
            'tizen': {
                dest: 'platforms/sectv-tizen/build'
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
