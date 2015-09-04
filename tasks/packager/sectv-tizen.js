'use strict';

var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');
var shelljs = require('shelljs');
var mustache = require('mustache');
// var grunt = require('grunt');
var zipdir = require('zip-dir');

module.exports = {
    build: function (successCallback, errorCallback, wwwSrc, dest, platformRepos, scripts) {
        console.log('\nStart building Samsung Tizen Platform......');

        // file path
        wwwSrc = path.resolve(wwwSrc);
        dest = path.resolve(dest);
        platformRepos = path.resolve(platformRepos);

        // config
        var cordovaConf = utils.getCordovaConfig();

        var userconf = {
            data : {},
            filepath : path.join(dest, '../userconf.json'),
            setUserConf : function(_data){
                this.data = _data;
            },
            getUserConf : function(){
                return this.data;                
            },
            saveFile : function(){
                fs.writeFileSync(this.filepath, JSON.stringify(this.data), {encoding: 'utf8'});
            },
            inputNewData : function(){
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
                    message: 'Application Version(Valid RegExp: \\d.\\d.\\d)',
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

                    userconf.setUserConf(config);
                    tizenUtil.buildProject();
                });
            }
        };

        var tizenUtil = {
            updateRevision : function(curver){
                var tmp = curver.split('.');
                var major = tmp[0];
                var minor = tmp[1];
                var revision = parseInt(tmp[2]) + 1;

                return major + '.' + minor + '.' + revision;
            },
            copySrcToDest : function() {
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
            },
            buildPlatformAdditions : function() {
                shelljs.cp('-rf', path.join(platformRepos, 'www', '*'), dest);

                // replace config.xml template with actual configuration
                this.replaceTemplate('config.xml');

                // replace .project template with actual configuration
                // .project is hidden file in linux
                this.replaceTemplate('project', true);
                this.replaceTemplate('tproject', true);

                return true;
            }, 
            replaceTemplate : function(filename, isHidden) {
                // replace config.xml template with actual configuration
                var data = userconf.getUserConf();

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
            },
            buildProject : function(){
                this.copySrcToDest() || (errorCallback && errorCallback());
                this.buildPlatformAdditions() || (errorCallback && errorCallback());

                userconf.saveFile();

                console.log('Built at ' + dest);
                successCallback && successCallback();
            }
        };

        if(fs.existsSync(userconf.filepath)){
            // userconf.json already exists

            var data = fs.readFileSync(userconf.filepath);
            data = JSON.parse(data);

            var curVer = data.version;
            var updateVer = tizenUtil.updateRevision(curVer);

            var cacheAsk = [{
                type: 'confirm',
                name: 'cache',
                message: 'Already have [userconf.json], Do you want to use this data?'
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
                    userconf.setUserConf(data);
                    tizenUtil.buildProject();
                }else{
                    // input new data
                    userconf.inputNewData();        
                }
            });
        }else{
            // create userconf.json, input new data
            userconf.inputNewData();
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
