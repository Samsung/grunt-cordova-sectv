'use strict';

var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');
var shelljs = require('shelljs');
var mustache = require('mustache');
var grunt = require('grunt');
var zipdir = require('zip-dir');

var userconfData = {};
var orsayData = {};
var userconfPath = '';

var minLen = 2;
var revLen = 3;

module.exports = {
    build: function (successCallback, errorCallback, wwwSrc, dest, platformRepos, scripts) {
        console.log('\nStart Building Legacy Samsung Smart TV Platform......');

        // file path
        wwwSrc = path.resolve(wwwSrc);
        dest = path.resolve(dest);
        platformRepos = path.resolve(platformRepos);
        userconfPath = path.join('platforms', 'userconf.json');

        // config
        var cordovaConf = utils.getCordovaConfig();

        if(!(fs.existsSync(userconfPath))){
            // userconf.json is not exists
            inputNewData();
        }
        else{
            // userconf.json is already exists
            userconfData = JSON.parse(fs.readFileSync(userconfPath));
            
            if(!(userconfData.hasOwnProperty('orsay'))){
                // userconf.json is empty
                console.log('\'userconf.json\' is empty. Please fill out the information again.');
                inputNewData();
            }
            else{
                // userconf.json has data
                orsayData = userconfData.orsay;
                var curVer = orsayData.version;
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
                    var data = orsayData;

                    console.log('');
                    console.log('      > [ Current Information ]');
                    console.log('      > name        : ' + data.name);
                    console.log('      > resolution  : ' + data.resolution);
                    console.log('      > category    : ' + data.category);
                    console.log('      > version     : ' + data.version);
                    console.log('      > description : ' + data.description);

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
                            return /^[0-9]+\.[0-9]+$/.test(input) ? true : 'invalid version string for orsay platform';
                        }
                    }];

                    inquirer.prompt(cacheAsk, function(answers){
                        if(answers.cache){
                            // use cache data
                            data.version = answers.revision;

                            orsayData = data;
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

            if(cordovaConf.contentSrc !== 'index.html') {
                if(fs.existsSync(path.join(dest, 'index.html'))) {
                    grunt.log.error('Initial content, which is pointed by \'content\' tag in the \'config.xml\'), is not \'index.html\', but another \'index.html\' is already exist in the source!');
                    return false;
                }
                shelljs.mv(path.join(dest, cordovaConf.contentSrc), path.join(dest, 'index.html'));
            }

            return true;
        }           

        function buildPlatformAdditions() {
            shelljs.cp('-rf', path.join(platformRepos, 'www', '*'), dest);

            // replace config.xml template with actual configuration
            replaceTemplate('config.xml.tmpl');
                        
            // replace widget.info template with actual configuration
            replaceTemplate('widget.info.tmpl');

            // replace .project template with actual configuration
            // .project is hidden file in linux
            replaceTemplate('project.tmpl', true);

            return true;
        }

        function replaceTemplate(filename, isHidden) {
            // replace config.xml template with actual configuration
            var data = orsayData;

            var tmplFile = fs.readFileSync(path.join(dest, filename), {encoding: 'utf8'});
            var rendered = mustache.render(tmplFile, data);
            var removal = '.tmpl';
            var resultFile = filename.substring(0, filename.length - removal.length);

            fs.writeFileSync(path.join(dest, filename + '.tmp'), rendered, {encoding: 'utf8'});
                                    
            //hidden file.......
            if(isHidden){
                resultFile =  '.'+resultFile;
            }
            
            shelljs.mv('-f', path.join(dest, filename + '.tmp'), path.join(dest, resultFile));
            shelljs.rm('-f', path.join(dest, filename));
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
                type: 'list',
                name: 'resolution',
                message: 'Which resolution does your application developed for?',
                default: '960x540',
                choices: [
                    '960x540',
                    '1280x720',
                    '1920x1080'
                ]
            }, {
                type: 'list',
                name: 'category',
                message: 'What\'s the application\'s category?',
                choices: [
                    'VOD', 'sports', 'game', 'lifestyle', 'information', 'education'
                ]
            }, {
                type: 'input',
                name: 'version',
                message: 'Application Version(Valid RegExp: ^[0-9]+\.[0-9]+$)',
                default: semVer2OrsayVer(cordovaConf.version),
                validate: function(input) {
                    return /^[0-9]+\.[0-9]+$/.test(input) ? true : 'invalid version string for orsay platform';
                }
            }, {
                type: 'input',
                name: 'description',
                message: 'Application Description',
                default: cordovaConf.description
            }, {
                type: 'input',
                name: 'authorName',
                message: 'Author\'s name',
                default: cordovaConf.authorName
            }, {
                type: 'input',
                name: 'authorEmail',
                message: 'Author\'s email',
                default: cordovaConf.authorEmail
            }, {
                type: 'input',
                name: 'authorHref',
                message: 'Author\'s IRI(href)',
                default: cordovaConf.authorHref
            }];

            inquirer.prompt(choice, function (answers) {
                var config = answers;

                var tmp = config.resolution.split('x');
                config.resWidth = parseInt(tmp[0], 10);
                config.resHeight = parseInt(tmp[1], 10);

                orsayData = config;
                buildProject();
            });
        }
    },
    package: function (successCallback, errorCallback, build, dest){
        console.log('\nStart packaging Legacy Samsung Smart TV Platform......');

        build = path.resolve(build);
        dest = path.resolve(dest);

        userconfPath = path.join('platforms', 'userconf.json');

        var projectName = 'package';

        if(fs.existsSync(userconfPath)){
            var data = JSON.parse(fs.readFileSync(userconfPath));

            if(data.hasOwnProperty('orsay')){
                projectName = data.orsay.name;
            }
        }else{
            grunt.log.error('Build the project first.');
        }

        fs.mkdir(dest, function(){
            zipdir(build, {saveTo: path.join(dest, projectName + '.zip')}, function(){
                console.log('Packaged at ' + dest);
                successCallback && successCallback();        
            });
        });
    }
};

function saveFile() {
    userconfData.orsay = orsayData;
    fs.writeFileSync(userconfPath, JSON.stringify(userconfData), {encoding: 'utf8'});
}

// OrsayUtil
function semVer2OrsayVer(semver) {
    var LEN_MINOR = 2;
    var LEN_REV = 3;

    var tmp = semver.split('.');
    
    if(tmp.length < 3){
        return semver;
    }
                
    var major = tmp[0];
    var minor = tmp[1];
    var rev = tmp[2];
                
    minor = '000000' + tmp[1];
    rev = '000000' + tmp[2];
    
    minor = tmp[1].length > LEN_MINOR ? tmp[1] : minor.substr(Math.max(minor.length-LEN_MINOR,LEN_MINOR));
    rev = tmp[2].length > LEN_REV ? tmp[2] : rev.substr(Math.max(rev.length-LEN_REV,LEN_REV));

    minLen = minor.length;
    revLen = rev.length;

    return major + '.' + minor + rev;
}

function updateRevision(curver) {
    var tmp = curver.split('.');
    
    var major = tmp[0];
    var minor = tmp[1].substring(0, tmp[1].length - revLen);
    var rev = tmp[1].substr(tmp[1].length - revLen);
    rev = parseInt(rev) + 1;

    return semVer2OrsayVer(major + '.' + minor + '.' + rev);
}