"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/*
 * Copyright 2015 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var fs = require("fs"); //npm install @types/node
var path = require("path");
var mkdirp = require("mkdirp");
var inquirer = require("inquirer");
var utils = require("../lib/utils");
var shelljs = require("shelljs");
var mustache = require("mustache");
var grunt = require("grunt");
var zipdir = require("zip-dir");
var js2xmlparser = require("js2xmlparser");
var revisionLength = 3;
var ORSAY_VERSION_TYPE = 2;
var SEMATIC_VERSION_TYPE = 3;
var PREPARE_DIRECTORY = "www";
var INDEX_HTML = "index.html";
var USERCONFIG_PATH = path.join("platforms", "userconf.json");
var PLATFORM_ORSAY = "sectv-orsay";
module.exports = {
    prepare: function (success, error, platformName, data) {
        return __awaiter(this, void 0, void 0, function () {
            var dest, config, platformRepos, userData, VERSION_ONLY, ENTIRE, isUsingSavedData, result, result, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\nStart preparing codes for Legacy Samsung Smart TV Platform......");
                        dest = path.resolve(data.dest || path.join("platforms", platformName, PREPARE_DIRECTORY));
                        return [4 /*yield*/, utils.getCordovaConfig()];
                    case 1:
                        config = _a.sent();
                        platformRepos = data.platformRepos || "../cordova-" + platformName;
                        platformRepos = path.resolve(platformRepos);
                        userData = getValidOrsayConfigData(USERCONFIG_PATH);
                        VERSION_ONLY = true;
                        ENTIRE = false;
                        if (!userData) return [3 /*break*/, 7];
                        return [4 /*yield*/, getConfirmAskData(userData)];
                    case 2:
                        isUsingSavedData = _a.sent();
                        if (!isUsingSavedData) return [3 /*break*/, 4];
                        return [4 /*yield*/, askUserData(config, userData, VERSION_ONLY)];
                    case 3:
                        result = _a.sent();
                        userData.version = result.version;
                        userData.manualConfData = getManualOrsayConfData(config.platform);
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, askUserData(config, userData, ENTIRE)];
                    case 5:
                        result = _a.sent();
                        userData = result;
                        userData.manualConfData = getManualOrsayConfData(config.platform);
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, askUserData(config, userData, ENTIRE)];
                    case 8:
                        result = _a.sent();
                        userData = result;
                        userData.manualConfData = getManualOrsayConfData(config.platform);
                        _a.label = 9;
                    case 9:
                        buildProject(success, error, dest, userData, data, platformRepos);
                        return [2 /*return*/];
                }
            });
        });
    },
    build: function (success, error, data) {
        console.log("\nStart packaging Legacy Samsung Smart TV Platform......");
        var www = data.www || path.join("platforms", PLATFORM_ORSAY, "www");
        var dest = data.dest || path.join("platforms", PLATFORM_ORSAY, "build");
        www = path.resolve(www);
        dest = path.resolve(dest);
        var projectName = "package";
        if (fs.existsSync(USERCONFIG_PATH)) {
            var userData = JSON.parse(fs.readFileSync(USERCONFIG_PATH));
            if (userData.hasOwnProperty("orsay")) {
                projectName = userData.orsay.name;
            }
        }
        else {
            grunt.log.error("Prepare the project first.");
        }
        fs.mkdir(dest, function () {
            zipdir(www, { saveTo: path.join(dest, projectName + ".zip") }, function () {
                console.log("Package created at " + path.join(dest, projectName));
                success && success();
            });
        });
    }
};
function saveUserConfigFile(configPath, data) {
    var userConfigData = {
        orsay: {}
    };
    if (isFileExist(configPath)) {
        userConfigData = JSON.parse(fs.readFileSync(configPath));
    }
    userConfigData.orsay = data;
    fs.writeFileSync(configPath, JSON.stringify(userConfigData, null, 2), {
        encoding: "utf8"
    });
}
function getNextVersion(currentVersion) {
    console.log('');
    var temp = currentVersion.split('.');
    var nextVersion = '';
    if (temp.length === ORSAY_VERSION_TYPE) {
        // orsay version
        var major = temp[0];
        var minor = temp[1];
        var minorLen = minor.length;
        var minorStr = (parseInt(minor) + 1).toString();
        var minorStrLen = minorStr.length;
        if (minorLen < minorStrLen) {
            var majorStr = (parseInt(major) + 1).toString();
            return majorStr + ".00000";
        }
        var makeZero = minorLen - minorStrLen;
        var zeroStr = '';
        while (makeZero--) {
            zeroStr += '0';
        }
        nextVersion = zeroStr + minorStr;
    }
    if (temp.length === SEMATIC_VERSION_TYPE) {
        // semantic version
        var major = temp[0];
        var minor = temp[1];
        var revision = temp[2];
        var revisionLen = revision.length;
        var revisionStr = (parseInt(revision) + 1).toString();
        var revisionStrLen = revisionStr.length;
        if (revisionLen < revisionStrLen) {
            var minorStr = (parseInt(minor) + 1).toString();
            return major + "." + minor + ".0";
        }
        var makeZero = revisionLen - revisionStrLen;
        var zeroStr = '';
        while (makeZero--) {
            zeroStr += '0';
        }
        nextVersion = zeroStr + revisionStr;
        return sementicToOrsay(major + "." + minor + "." + nextVersion);
    }
}
function getValidOrsayConfigData(configPath) {
    console.log(configPath);
    if (!isFileExist(configPath)) {
        // userconf.json is not exist
        return null;
    }
    // userconf.json is already exist
    var userConfigData = JSON.parse(fs.readFileSync(configPath));
    if (!userConfigData.hasOwnProperty('orsay')) {
        // userconf.json doesn't have orsay data
        return null;
    }
    var orsayData = userConfigData.orsay;
    if (!isValidString("name")) {
        // name is invalid
        return null;
    }
    if (!isValidString("thumbicon")) {
        // thumbicon is invalid
        return null;
    }
    if (!isValidString("bigthumbicon")) {
        // bigthumbicon is invalid
        return null;
    }
    if (!isValidString("listicon")) {
        // listicon is invalid
        return null;
    }
    if (!isValidString("biglisticon")) {
        // biglisticon is invalid
        return null;
    }
    if (!validateOrsayVersion(orsayData.version)) {
        // version is invalid
        return null;
    }
    // description is not mendatory
    return orsayData;
}
function validateOrsayVersion(version) {
    var temp = version.split(".");
    var i = 0;
    if (temp.length !== ORSAY_VERSION_TYPE) {
        return false;
    }
    for (i = 0; i < temp.length; i++) {
        if (isNaN(parseInt(temp[i]))) {
            return false;
        }
    }
    return i === temp.length;
}
function isValidString(data) {
    if (typeof data !== 'string' || data.length <= 0) {
        return false;
    }
    return true;
}
function sementicToOrsay(sementicVersion) {
    var MINOR_LENGTH = 2;
    var REVISION_LENGTH = 3;
    var temp = sementicVersion.split(".");
    if (temp.length < REVISION_LENGTH) {
        return sementicVersion;
    }
    var major = temp[0];
    var minor = temp[1];
    var revision = temp[2];
    minor = '000000' + temp[1];
    revision = '000000' + temp[2];
    minor =
        temp[1].length > MINOR_LENGTH
            ? temp[1]
            : minor.substr(Math.max(minor.length - MINOR_LENGTH, MINOR_LENGTH));
    revision =
        temp[2].length > REVISION_LENGTH
            ? temp[2]
            : revision.substr(Math.max(revision.length - REVISION_LENGTH, REVISION_LENGTH));
    revisionLength = revision.length;
    return major + '.' + minor + revision;
}
function getConfirmAskData(userData) {
    return __awaiter(this, void 0, void 0, function () {
        var ask, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    displayData(userData);
                    ask = [
                        {
                            type: "confirm",
                            name: "isCorrectInfo",
                            message: "\"userconf.json\" is already exist. Do you want to use this data?",
                            default: true
                        }
                    ];
                    return [4 /*yield*/, inquirer.prompt(ask)];
                case 1:
                    answer = _a.sent();
                    return [2 /*return*/, answer.isCorrectInfo];
            }
        });
    });
}
function askUserData(cordovaConf, userData, versionOnly) {
    return __awaiter(this, void 0, void 0, function () {
        var ask, currentVersion, updateVersion, answer, answer, result, temp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ask = [];
                    if (!versionOnly) return [3 /*break*/, 2];
                    currentVersion = userData.version;
                    updateVersion = getNextVersion(currentVersion);
                    ask = [
                        {
                            type: "input",
                            name: "version",
                            message: "current version is " + currentVersion + ". Application version: ",
                            default: updateVersion,
                            validate: function (input) {
                                return /^[0-9]+\.[0-9]+$/.test(input)
                                    ? true
                                    : "invalid version string for orsay platform";
                            }
                        }
                    ];
                    return [4 /*yield*/, inquirer.prompt(ask)];
                case 1:
                    answer = _a.sent();
                    return [2 /*return*/, answer];
                case 2:
                    ask = [
                        {
                            type: "input",
                            name: "name",
                            message: "What's the application's name?",
                            default: cordovaConf.name,
                            validate: function (input) {
                                return /^[a-zA-Z][^~!\.\;\\\/\|\"\'@\#$%<>^&*\()\-=+_\’\n\t\s]*$/.test(input)
                                    ? true
                                    : "invalid name for orsay platform";
                            }
                        },
                        {
                            type: "list",
                            name: "resolution",
                            message: "Which resolution does your application developed for?",
                            default: "960x540",
                            choices: ["960x540", "1280x720", "1920x1080"]
                        },
                        {
                            type: "list",
                            name: "category",
                            message: "What's the application's category?",
                            choices: [
                                "VOD",
                                "sports",
                                "game",
                                "lifestyle",
                                "information",
                                "education"
                            ]
                        },
                        {
                            type: "input",
                            name: "version",
                            message: "Application Version(Valid RegExp: ^[0-9]+.[0-9]+$)",
                            default: sementicToOrsay(cordovaConf.version),
                            validate: function (input) {
                                return /^[0-9]+\.[0-9]+$/.test(input)
                                    ? true
                                    : "invalid version string for orsay platform";
                            }
                        },
                        {
                            type: "input",
                            name: "thumbicon",
                            message: "ThumbIcon path (default is 'img/logo.png')",
                            default: "img/logo.png",
                            validate: function (input) {
                                return typeof input === "string"
                                    ? true
                                    : "invalid iconpath";
                            }
                        },
                        {
                            type: "input",
                            name: "bigthumbicon",
                            message: "BigThumbIcon path (default is 'img/logo.png')",
                            default: "img/logo.png",
                            validate: function (input) {
                                return typeof input === "string"
                                    ? true
                                    : "invalid iconpath";
                            }
                        },
                        {
                            type: "input",
                            name: "listicon",
                            message: "ListIcon path (default is 'img/logo.png')",
                            default: "img/logo.png",
                            validate: function (input) {
                                return typeof input === "string"
                                    ? true
                                    : "invalid iconpath";
                            }
                        },
                        {
                            type: "input",
                            name: "biglisticon",
                            message: "BigListIcon path (default is 'img/logo.png')",
                            default: "img/logo.png",
                            validate: function (input) {
                                return typeof input === "string"
                                    ? true
                                    : "invalid iconpath";
                            }
                        },
                        {
                            type: "input",
                            name: "description",
                            message: "Application Description",
                            default: utils.trim(cordovaConf.description)
                        },
                        {
                            type: "input",
                            name: "authorName",
                            message: "Author's name",
                            default: cordovaConf.authorName
                        },
                        {
                            type: "input",
                            name: "authorEmail",
                            message: "Author's email",
                            default: cordovaConf.authorEmail
                        },
                        {
                            type: "input",
                            name: "authorHref",
                            message: "Author's IRI(href)",
                            default: cordovaConf.authorHref
                        }
                    ];
                    return [4 /*yield*/, inquirer.prompt(ask)];
                case 3:
                    answer = _a.sent();
                    result = answer;
                    temp = result.resolution.split("x");
                    result.resWidth = parseInt(temp[0], 10);
                    result.resHeight = parseInt(temp[1], 10);
                    return [2 /*return*/, result];
            }
        });
    });
}
function displayData(userData) {
    console.log("");
    console.log("      > [ Stored Information ]");
    console.log("      > name        : " + userData.name);
    console.log("      > resolution  : " + userData.resolution);
    console.log("      > category    : " + userData.category);
    console.log("      > version     : " + userData.version);
    console.log("      > description : " + userData.description);
    console.log("");
}
function prepareDirectory(directory) {
    mkdirp.sync(directory);
}
function getManualOrsayConfData(platformsData) {
    var i = 0;
    var manualOrsayConfData = {};
    if (platformsData) {
        for (i = 0; i < platformsData.length; i++) {
            if (platformsData[i].$.name === PLATFORM_ORSAY) {
                delete platformsData[i].$;
                manualOrsayConfData = utils.trim(js2xmlparser('platform', platformsData[i], {
                    declaration: { include: false },
                    attributeString: '$'
                }).replace(/<(\/?platform)>/gim, ''));
            }
        }
    }
    return manualOrsayConfData;
}
function buildProject(success, error, dest, userData, data, platformRepos) {
    var scripts = data.scripts;
    copySrcToDest(dest, scripts) || (error && error());
    buildPlatformAdditions(platformRepos, dest) || (error && error());
    replaceTemplates(dest, userData) || (error && error());
    console.log("Prepared at " + dest);
    // warning for existing meta tag for csp setting
    var targetFile = path.join(path.resolve(PREPARE_DIRECTORY), INDEX_HTML);
    var target = fs.readFileSync(targetFile, {
        encoding: "utf8"
    });
    if (target.match(/(<meta.*)(http-equiv)(.*=*.)("Content-Security-Policy"|'Content-Security-Policy')/)) {
        console.log("\nWARNING!!!!! REMOVE meta tag for csp setting in the \"index.html\"");
        console.log("It is not supported in this platform. It would be caused abnormal operation.");
        console.log("Please confirm your file : " + targetFile);
    }
    saveUserConfigFile(USERCONFIG_PATH, userData);
    success && success();
}
function copySrcToDest(dest, scripts) {
    var wwwSrc = path.resolve(PREPARE_DIRECTORY);
    var cordovaConf = utils.getCordovaConfig();
    prepareDirectory(dest);
    for (var key in scripts) {
        if (scripts.hasOwnProperty(key)) {
            var to = path.join(dest, key);
            var from = path.resolve(scripts[key]);
            shelljs.cp("-f", from, to);
            if (!fs.existsSync(from)) {
                throw Error("cordova.js, toast.js file are not exist.");
            }
        }
    }
    shelljs.cp("-rf", path.join(wwwSrc, "*"), dest);
    if (cordovaConf.contentSrc !== INDEX_HTML) {
        if (fs.existsSync(path.join(dest, INDEX_HTML))) {
            grunt.log.error("Initial content, which is pointed by 'content' tag in the 'config.xml'), is not 'index.html', but another 'index.html' is already exist in the source!");
            return false;
        }
        shelljs.mv(path.join(dest, cordovaConf.contentSrc), path.join(dest, INDEX_HTML));
    }
    return true;
}
function buildPlatformAdditions(platformRepos, dest) {
    shelljs.cp('-rf', path.join(platformRepos, PREPARE_DIRECTORY, '*'), dest);
    // hack: copying hidden files(starts with dot) at root('www') to the dest directory.
    // if the dest is not exist, we can copy the platform files without this hack by using this command: cp -rf <PLATFORMREPOS>/www <destDir>
    // But the dest directory has the application files at this moment. So we need to use this hack.
    shelljs.cp('-rf', path.join(platformRepos, PREPARE_DIRECTORY, '.*'), dest);
    return true;
}
function replaceTemplates(dest, userData) {
    var files = fs.readdirSync(dest);
    for (var i = 0; i < files.length; i++) {
        var fileName = files[i];
        if (fileName.match(/\.tmpl$/)) {
            var tmplFilePath = path.join(dest, fileName);
            var destFilePath = path.join(dest, fileName.replace(/\.tmpl$/, ""));
            var template = fs.readFileSync(tmplFilePath, {
                encoding: "utf8"
            });
            var rendered = mustache.render(template, userData);
            fs.writeFileSync(destFilePath, rendered, {
                encoding: "utf8"
            });
            shelljs.rm(path.join(dest, fileName));
        }
    }
    return true;
}
function isFileExist(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    }
    catch (e) {
        return false;
    }
}
