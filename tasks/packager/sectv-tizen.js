'use strict';

var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');
var shelljs = require('shelljs');
var mustache = require('mustache');
var zipdir = require('zip-dir');

var userconfData = {};
var userconfPath = '';

module.exports = {
    build: function (successCallback, errorCallback, wwwSrc, dest, platformRepos, scripts) {
        console.log('\nStart building Samsung Tizen Platform......');

        // file path
        wwwSrc = path.resolve(wwwSrc);
        dest = path.resolve(dest);
        platformRepos = path.resolve(platformRepos);
        userconfPath = path.join(dest, '../userconf.json');

        // config
        var cordovaConf = utils.getCordovaConfig();

        if(!(fs.existsSync(userconfPath))){
            // userconf.json is not exists
            inputNewData();
        }
        else{
            // userconf.json is already exists
            var data = fs.readFileSync(userconfPath);
            data = JSON.parse(data);

            if(!(data.hasOwnProperty('version'))){
                // userconf.json is empty
                console.log('\'userconf.json\' is empty. Please fill out the information again.');
                inputNewData();
            }
            else{
                // userconf.json has data
                var curVer = data.version;
                var tmp = curVer.split('.');

                var i = 0 ;
                for(i = 0; i < tmp.length; i++){
                    if(isNaN(tmp[i])){
                        break;
                    }
                }

                if((i != tmp.length) || (tmp.length > 3) || (tmp.length < 2)){
                    // version is invalid
                    console.log('\'userconf.json\' has invalid data. Please fill out the information again.');
                    inputNewData();
                }
                else{
                    // version is valid
                    var updateVer = updateRevision(curVer);

                    var cacheAsk = [{
                        type: 'confirm',
                        name: 'cache',
                        message: 'Already have \'userconf.json\', Do you want to use this data?'
                    }, {
                        when: function(response){
                            return response.cache;
                        },
                        type: 'input',
                        name: 'revision',
                        message: '(current version is '+curVer+ '), Application version',
                        default: updateVer,
                        validate: function(input) {
                            return /\d.\d.\d/.test(input) ? true : 'invalid version string for tizen platform';
                        }
                    }];
                    
                    inquirer.prompt(cacheAsk, function(answers){
                        if(answers.cache){
                            // use cache data
                            data.version = answers.revision;
                            setUserConf(data);
                            buildProject();
                        }else{
                            // input new data
                            inputNewData();        
                        }
                    });
                }
            }
        }

        function copySrcToDest() {
            var tmp = dest.split(path.sep);
                        
            var curPath = tmp[0];
            for(var i=1; i<tmp.length; i++) {
                curPath = path.join(curPath, tmp[i]);
                !fs.existsSync(curPath) && fs.mkdirSync(curPath);
            }

            for(var key in scripts){
                if(scripts.hasOwnProperty(key)){
                    var to = path.join(dest, key);
                    var from = path.resolve(scripts[key]);

                    shelljs.cp('-f', from, to);
                }
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
            var data = getUserConf();

            var tmplFile = fs.readFileSync(path.join(dest, filename), {encoding: 'utf8'});
            var rendered = mustache.render(tmplFile, data);

            fs.writeFileSync(path.join(dest, filename + '.tmp'), rendered, {encoding: 'utf8'});
                        
            //hidden file.......
            if(isHidden){
                shelljs.mv('-f', path.join(dest, filename + '.tmp'), path.join(dest, '.'+filename));
                shelljs.rm('-f', path.join(dest, filename));
            }else{
                shelljs.mv('-f', path.join(dest, filename + '.tmp'), path.join(dest, filename));
            }
        }

        function buildProject() {
            copySrcToDest() || (errorCallback && errorCallback());
            buildPlatformAdditions() || (errorCallback && errorCallback());

            saveFile();

            console.log('Built at ' + dest);
            successCallback && successCallback();
        }

        function inputNewData() {
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
                    return /[0-9a-zA-Z]{10}/.test(input) ? true : 'invalid id string for tizen platform';
                }
            }, {
                type: 'input',
                name: 'version',
                message: 'Application Version(Valid RegExp: /\d./\d./\d)',
                default: cordovaConf.version,
                validate: function(input) {
                    return /\d.\d.\d/.test(input) ? true : 'invalid version string for tizen platform';
                }
            }, {
                type: 'input',
                name: 'description',
                message: 'Application Description',
                default: cordovaConf.description
            }];

            inquirer.prompt(choice, function (answers) {
                var config = answers;

                setUserConf(config);
                buildProject();
            });
        }
    },
    package: function (successCallback, errorCallback, build, dest){
        console.log('\nStart packaging Samsung Tizen TV Platform......');

        build = path.resolve(build);
        dest = path.resolve(dest);

        fs.mkdir(dest, function(){
            zipdir(build, {saveTo: path.join(dest, 'package.wgt')}, function(){
                console.log('Packaged at ' + dest);
                successCallback && successCallback();        
            });
        });
    }
};

//userConf
function setUserConf(data) {
    userconfData = data;
}

function getUserConf() {
    return userconfData;
}

function saveFile() {
    fs.writeFileSync(userconfPath, JSON.stringify(userconfData), {encoding: 'utf8'});
}

// tizenUtil
function updateRevision(curver) {
    var tmp = curver.split('.');
    var major = tmp[0];
    var minor = tmp[1];
    var revision = 1;

    if(tmp[2]){
        revision = parseInt(tmp[2]) + 1;
    }

    return parseInt(major) + '.' + parseInt(minor) + '.' + revision;
}