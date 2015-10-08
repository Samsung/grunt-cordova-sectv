'use strict';

var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');
var shelljs = require('shelljs');
var mustache = require('mustache');
var grunt = require('grunt');
var zipdir = require('zip-dir');
var child_process = require('child_process');

function saveUserConfFile(configPath, tizenConf) {
    var userConfData = {};
    if (fs.existsSync(configPath)) {
        userConfData = JSON.parse(fs.readFileSync(configPath));
    }
    userConfData.tizen = tizenConf;
    fs.writeFileSync(configPath, JSON.stringify(userConfData, null, 2), {
        encoding: 'utf8'
    });
}

function getNextSemVersion(curver) {    // just increase revision
    var tmp = curver.split('.');
    var major = parseInt(tmp[0], 10);
    var minor = parseInt(tmp[1], 10);
    var revision = (parseInt(tmp[2], 10) || 0) + 1;

    return major + '.' + minor + '.' + revision;
}

function generateTizenPackageID() {
    return Math.random().toString(36).substr(2, 10);
}

function getValidTizenConfData(configPath) {
    console.log(configPath);
    if (!(fs.existsSync(configPath))) {
        // userconf.json is not exists
        return null;
    }
    // userconf.json is already exists
    var userConfData = JSON.parse(fs.readFileSync(configPath));

    if (!(userConfData.hasOwnProperty('tizen'))) {
        // userconf.json doesn't have tizen data
        return null;
    }
    var tizenData = userConfData.tizen;
    if (typeof tizenData.name !== 'string' || tizenData.name.length <= 0) {
        // name is invalid
        return null;
    }
    if (typeof tizenData.packageid !== 'string' || tizenData.packageid.length !== 10) {
        // packageid is invalid
        return null;
    }
    if (!validateTizenVersion(tizenData.version)) {
        // version is invalid
        return null;
    }
    // description is not mendatory

    return tizenData;
}

function validateTizenVersion(version) {
    var tmp = version.split('.'),
        i;
    if (tmp.length !== 3) {
        return false;
    }
    for (i = 0; i < tmp.length; i++) {
        if (isNaN(tmp[i])) {
            return false;
        }
    }

    return i === tmp.length;
}

function confirmUseExistingData(userData, callback) {
    console.log('');
    console.log('      > [ Stored Information ]');
    console.log('      > name        : ' + userData.name);
    console.log('      > package ID  : ' + userData.packageid);
    console.log('      > version     : ' + userData.version);
    console.log('      > description : ' + userData.description);

    var ask = [{
        type: 'confirm',
        name: 'useExisting',
        message: 'Already have \'userconf.json\', Do you want to use this data?'
    }];

    inquirer.prompt(ask, function(answers) {
        callback(!!answers.useExisting);
    });
}

function askUserData(cordovaConf, callback, versionOnly, userData) {
    var ask;
    if(versionOnly) {
        var curVer = userData.version;
        var updateVer = getNextSemVersion(userData.version);
        ask = [{
            type: 'input',
            name: 'version',
            message: 'Current version is ' + curVer + '. Application version: ',
            default: updateVer,
            validate: function(input) {
                return /\d.\d.\d/.test(input) ? true : 'invalid version string for tizen platform';
            }
        }];
        inquirer.prompt(ask, function(answers) {
            callback(answers);
        });
    }
    else {
        ask = [{
            type: 'input',
            name: 'name',
            message: 'What\'s the application\'s name?',
            default: cordovaConf.name
        }, {
            type: 'input',
            name: 'packageid',
            message: 'Package Id (Valid RegExp: [0-9a-zA-Z]{10})',
            default: generateTizenPackageID(),
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
            default: utils.trim(cordovaConf.description)
        }];
        inquirer.prompt(ask, function(answers) {
            callback(answers);
        });
    }
}

function prepareDir(dir) {
    dir = path.resolve(dir);
    var tmp = dir.split(path.sep);
    var curPath = tmp[0];
    for (var i=1; i<tmp.length; i++) {
        curPath = path.join(curPath, tmp[i]);
        if (!fs.existsSync(curPath)) {
            fs.mkdirSync(curPath);
        }
    }
}

module.exports = {
    build: function(successCallback, errorCallback, wwwSrc, dest, platformRepos, scripts) {
        console.log('\nStart building Samsung Tizen Platform......');

        // file path
        wwwSrc = path.resolve(wwwSrc);
        dest = path.resolve(dest);
        platformRepos = path.resolve(platformRepos);
        var userConfPath = path.join('platforms', 'userconf.json');

        // config
        var cordovaConf = utils.getCordovaConfig();
        var userData = getValidTizenConfData(userConfPath);
        if(userData) {
            confirmUseExistingData(userData, function (useExisting) {
                if(useExisting) {
                    askUserData(cordovaConf, function (data) {
                        userData.version = data.version;
                        buildProject();
                    }, true, userData);
                }
                else {
                    askUserData(cordovaConf, function (data) {
                        userData = data;
                        buildProject();
                    });
                }
            })
        }
        else {
            askUserData(cordovaConf, function (data) {
                userData = data;
                buildProject();
            });
        }

        function buildProject() {
            copySrcToDest() || (errorCallback && errorCallback());
            buildPlatformAdditions() || (errorCallback && errorCallback());
            replaceTemplates() || (errorCallback && errorCallback());
            console.log('Built at ' + dest);

            saveUserConfFile(userConfPath, userData);
            successCallback && successCallback();
        }

        function copySrcToDest() {
            prepareDir(dest);

            for (var key in scripts) {
                if (scripts.hasOwnProperty(key)) {
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
            // hack: copying hidden files(starts with dot) at root('www') to the dest directory.
            // if the dest is not exist, we can copy the platform files without this hack by using this command: cp -rf <PLATFORMREPOS>/www <destDir>
            // But the dest directory has the application files at this moment. So we need to use this hack.
            shelljs.cp('-rf', path.join(platformRepos, 'www', '.*'), dest);
            return true;
        }

        function replaceTemplates() {
            var files = fs.readdirSync(dest);
            for(var i=0; i<files.length; i++) {
                var fileName = files[i];
                if(fileName.match(/\.tmpl$/)) {
                    var tmplFilePath = path.join(dest, fileName);
                    var destFilePath = path.join(dest, fileName.replace(/\.tmpl$/, ''));
                    var template = fs.readFileSync(tmplFilePath, {
                        encoding: 'utf8'
                    });
                    var rendered = mustache.render(template, userData);
                    fs.writeFileSync(destFilePath, rendered, {
                        encoding: 'utf8'
                    });
                    shelljs.rm(path.join(dest, fileName));
                }
            }
            return true;
        }
    },
    package: function(successCallback, errorCallback, data) {
        console.log('\nStart packaging Samsung Tizen TV Platform......');
        var build = data.build || path.join('platforms', platformName, 'www');
        var dest = data.dest || path.join('platforms', platformName, 'build');
        var TEMPORARY_BUILD_DIR = '.buildResult';

        build = path.resolve(build);
        dest = path.resolve(dest);
        child_process.exec('tizen version', function(err, stdout, stderr) {
            if(err) {
                throw Error('The command \"tizen\" failed. Make sure you have the latest Tizen SDK installed, and the \"tizen\" command (inside the tools/ide/bin folder) is added to your path.');
            }
            console.log(stdout);

            // reference url : https://developer.tizen.org/development/tools/web-tools/command-line-interface#mw_package
            var result = shelljs.exec('tizen cli-config "default.profiles.path=' + path.resolve(data.profilePath) + '"');
            if(result.code) {
                throw Error(result.output);
            }
            result = shelljs.exec('tizen build-web -out ' + TEMPORARY_BUILD_DIR + ' -- "' + path.resolve(build) + '"');
            if(result.code) {
                throw Error(result.output);
            }
            result = shelljs.exec('tizen package --type wgt --sign ' + data.profileName + ' -- ' + path.resolve(path.join(build, TEMPORARY_BUILD_DIR)));
            if(result.code) {
                throw Error(result.output);
            }
            else {
                var packagePath = result.output.match(/Package File Location\:\s*(.*)/);
                if(packagePath && packagePath[1]) {
                    prepareDir(dest);
                    shelljs.mv('-f', packagePath[1], path.resolve(dest));
                    shelljs.rm('-rf', path.resolve(path.join(build, TEMPORARY_BUILD_DIR)));
                    console.log("Package created at " + path.join(dest, path.basename(packagePath)));
                }
                else {
                    throw Error('Fail to retrieve Package File Location.');
                }
            }
        });
    }
};
