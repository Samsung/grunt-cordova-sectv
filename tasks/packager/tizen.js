var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');
var shelljs = require('shelljs');
var mustache = require('mustache');
var grunt = require('grunt');
var jszip = require('jszip');

module.exports = {
    build: function (successCallback, errorCallback, wwwSrc, dest, platformRepos) {
        console.log("\nStart building Samsung Tizen Platform......");
        wwwSrc = path.resolve(wwwSrc);
        dest = path.resolve(dest);
        platformRepos = path.resolve(platformRepos);

        var cordovaConf = utils.getCordovaConfig();
        var choice = [{
            type: 'input',
            name: 'name',
            message: 'What\'s the application\'s name?',
            default: cordovaConf.name
        }, {
            type: 'input',
            name: 'id',
            message: 'Application Id (Valid RegExp: [0-9a-zA-Z]{10})',
            default: 'puttizenid',
            validate: function(input) {
                return /[0-9a-zA-Z]{10}/.test(input) ? true : "invalid id string for tizen platform";
            }
        }, {
            type: 'input',
            name: 'version',
            message: 'Application Version(Valid RegExp: [0-9][.][0-9][.][0-9])',
            default: cordovaConf.version,
            validate: function(input) {
                return /[0-9][.][0-9][.][0-9]/.test(input) ? true : "invalid version string for tizen platform";
            }
        }, {
            type: 'input',
            name: 'description',
            message: 'Application Description',
            default: 'Web application for Samsung Tizen TV'
        }];

        var config = {};
        inquirer.prompt(choice, function (answers) {
            config = answers;

            copySrcToDest() || (errorCallback && errorCallback());
            buildPlatformAdditions() || (errorCallback && errorCallback());

            grunt.log.write('\n\nBuilt at ' + dest);
            successCallback && successCallback();
        });

        function copySrcToDest() {
            var tmp = dest.split(path.sep);
            //console.log(tmp);
            var curPath = tmp[0];
            for(var i=1; i<tmp.length; i++) {
                curPath = path.join(curPath, tmp[i]);
                //console.log("curPath: " + curPath);
                !fs.existsSync(curPath) && fs.mkdirSync(curPath);
            }
            shelljs.cp('-rf', path.join(wwwSrc, '*'), dest);
            return true;
        }

        function buildPlatformAdditions() {
            shelljs.cp('-rf', path.join(platformRepos, 'www', '*'), dest);

            // replace config.xml template with actual configuration
            replaceTemplate('config.xml');

            // replace .project template with actual configuration
            // .project is hidden file in linux
            replaceTemplate('project', true);
            replaceTemplate('tproject', true);

            return true;
        }

        function replaceTemplate(filename, isHidden) {
            // replace config.xml template with actual configuration
            var tmplFile = fs.readFileSync(path.join(dest, filename), {encoding: 'utf8'});
            var rendered = mustache.render(tmplFile, config);

            //console.log(rendered);
            fs.writeFileSync(path.join(dest, filename + '.tmp'), rendered, {encoding: 'utf8'});
            
            //hidden file.......
            if(isHidden){
                shelljs.mv('-f', path.join(dest, filename + '.tmp'), path.join(dest, '.'+filename));
                shelljs.rm('-f', path.join(dest, filename));
            }else{
                shelljs.mv('-f', path.join(dest, filename + '.tmp'), path.join(dest, filename));
            }

            return true;
        }
    },
    package: function (successCallback, errorCallback, build, dest) {
        // console.log("\nPackage Tizen: " + JSON.stringify(Array.prototype.slice.call(arguments, 0)));
        console.log("\nStart packaging Samsung Tizen TV Platform......");
    }
};