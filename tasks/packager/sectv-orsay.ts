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

/*
TargetPrepareData => 
this.data {
  dest: 'platforms/sectv-orsay/www',
  platformRepos: '../cordova-sectv-orsay',
  scripts: {
    'cordova.js': '../cordova-js/pkg/cordova.sectv-orsay.js',
    'toast.js': '../cordova-plugin-toast/platform_www/sectv-orsay/toast.js'
  }
}
*/
/*
TargetBuildData => 
this.data {
    www: 'platforms/sectv-orsay/www',
    dest: 'platforms/sectv-orsay/build'
}
*/

/*
UserInputData => 
{
  name: 'ToastApp',
  resolution: '960x540',
  category: 'VOD',
  version: '1.0002',
  thumbicon: 'img/logo.png',
  bigthumbicon: 'img/logo.png',
  listicon: 'img/logo.png',
  biglisticon: 'img/logo.png',
  description: 'A sample Apache Cordova application that responds to the deviceready event.',
  authorName: 'Apache Cordova Team',
  authorEmail: 'dev@cordova.apache.org',
  authorHref: 'http://cordova.io',
  resWidth: 960,
  resHeight: 540,
  manualConfData: {}
}
*/
/*
CordovaConfigData =>
{
  raw: {
    widget: {
      '$': [Object],
      name: [Array],
      description: [Array],
      author: [Array],
      content: [Array],
      plugin: [Array],
      access: [Array],
      'allow-intent': [Array],
      platform: [Array]
    }
  },
  contentSrc: 'index.html',
  version: '1.0.0',
  name: 'HelloCordova',
  description: [
    '\n' +
      '        A sample Apache Cordova application that responds to the deviceready event.\n' +
      '    '
  ],
  authorName: 'Apache Cordova Team',
  authorEmail: 'dev@cordova.apache.org',
  authorHref: 'http://cordova.io',
  platform: [
    { '$': [Object], 'allow-intent': [Array] },
    { '$': [Object], 'allow-intent': [Array] }
  ]
}
*/

interface TargetPrepareData {
    dest: string;
    platformRepos: string;
    scripts: TargetDataScript;
}

interface TargetBuildData {
    www: string;
    dest: string;
}

interface TargetDataScript {
    [key: string]: string;
}

interface UserInputData {
    name: string;
    resolution: string;
    category: string;
    version: string;
    thumbicon: string;
    bigthumbicon: string;
    listicon: string;
    biglisticon: string;
    description: string;
    authorName: string;
    authorEmail: string;
    authorHref: string;
    resWidth: number;
    resHeight: number;
    manualConfData: object;
}

interface CordovaConfigData {
    raw: object;
    contentSrc: string;
    version: string;
    name: string;
    description: any; //이건 무슨타입이죠
    authorName: string;
    authorEmail: string;
    authorHref: string;
    platform: PlatformProperty[];
}

interface PlatformProperty {
    $: Platform;
    'allow-intent': object[];
}

interface Platform {
    name: string;
}

// [@고민:1] require 혹은 import
const utils = require('../lib/utils');
const zipdir = require('zip-dir');
const js2xmlparser = require('js2xmlparser');

import fs from 'fs'; //npm install @types/node
import path from 'path'; //npm install @types/node
import mkdirp from 'mkdirp';
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import mustache from 'mustache';
import grunt from 'grunt';

const ORSAY_VERSION_TYPE = 2;
const SEMATIC_VERSION_TYPE = 3;
const PREPARE_DIRECTORY = `www`;
const INDEX_HTML = `index.html`;
const USERCONFIG_PATH = path.join(`platforms`, `userconf.json`);
const PLATFORM_ORSAY = `sectv-orsay`;
let revisionLength = 3;

module.exports = {
    prepare: async function(
        success: any,
        error: any,
        platformName: string,
        data: TargetPrepareData
    ) {
        console.log(
            `\nStart preparing codes for Legacy Samsung Smart TV Platform......`
        );

        // destination folder to paste necessary files for toast project
        let dest = path.resolve(
            data.dest || path.join(`platforms`, platformName, PREPARE_DIRECTORY)
        );

        let config = await utils.getCordovaConfig();

        // target repository
        let platformRepos = data.platformRepos || `../cordova-${platformName}`;
        platformRepos = path.resolve(platformRepos);

        // get data from userconf.json
        let userData = getValidOrsayConfigData(USERCONFIG_PATH);

        const VERSION_ONLY = true;
        const ENTIRE = false;

        if (userData) {
            // exist userconf for orsay
            let isUsingSavedData = await getConfirmAskData(userData);
            if (isUsingSavedData) {
                let result = await askUserData(config, userData, VERSION_ONLY);
                userData.version = result.version;
                userData.manualConfData = getManualOrsayConfData(
                    config.platform
                );
            } else {
                let result = await askUserData(config, userData, ENTIRE);
                userData = result;
                userData.manualConfData = getManualOrsayConfData(
                    config.platform
                );
            }
        } else {
            // not exist userconf for orsay
            let result = await askUserData(config, userData, ENTIRE);
            userData = result;
            userData.manualConfData = getManualOrsayConfData(config.platform);
        }
        buildProject(success, error, dest, userData, data, platformRepos);
    },
    build: function(success: Function, error: Function, data: TargetBuildData) {
        console.log(`\nStart packaging Legacy Samsung Smart TV Platform......`);
        let www = data.www || path.join(`platforms`, PLATFORM_ORSAY, `www`);
        let dest = data.dest || path.join(`platforms`, PLATFORM_ORSAY, `build`);

        www = path.resolve(www);
        dest = path.resolve(dest);

        let projectName = `package`;

        if (fs.existsSync(USERCONFIG_PATH)) {
            let userData = JSON.parse(fs.readFileSync(USERCONFIG_PATH));

            if (userData.hasOwnProperty(`orsay`)) {
                projectName = userData.orsay.name;
            }
        } else {
            grunt.log.error(`Prepare the project first.`);
        }

        fs.mkdir(dest, function() {
            zipdir(
                www,
                { saveTo: path.join(dest, `${projectName}.zip`) },
                function() {
                    console.log(
                        `Package created at ${path.join(dest, projectName)}`
                    );
                    success && success();
                }
            );
        });
    }
};

function saveUserConfigFile(configPath: string, data: object) {
    let userConfigData = {
        orsay: {}
    };
    if (isFileExist(configPath)) {
        userConfigData = JSON.parse(fs.readFileSync(configPath));
    }
    userConfigData.orsay = data;
    fs.writeFileSync(configPath, JSON.stringify(userConfigData, null, 2), {
        encoding: `utf8`
    });
}

function getNextVersion(currentVersion: string) {
    console.log('');
    let temp = currentVersion.split('.');
    let nextVersion = '';

    if (temp.length === ORSAY_VERSION_TYPE) {
        // orsay version
        const major = temp[0];
        const minor = temp[1];

        const minorLen = minor.length;

        const minorStr = (parseInt(minor) + 1).toString();
        const minorStrLen = minorStr.length;

        if (minorLen < minorStrLen) {
            let majorStr = (parseInt(major) + 1).toString();
            return `${majorStr}.00000`;
        }
        let makeZero = minorLen - minorStrLen;
        let zeroStr = '';
        while (makeZero--) {
            zeroStr += '0';
        }
        nextVersion = zeroStr + minorStr;
    }

    if (temp.length === SEMATIC_VERSION_TYPE) {
        // semantic version
        const major = temp[0];
        const minor = temp[1];
        const revision = temp[2];

        const revisionLen = revision.length;

        const revisionStr = (parseInt(revision) + 1).toString();
        const revisionStrLen = revisionStr.length;

        if (revisionLen < revisionStrLen) {
            const minorStr = (parseInt(minor) + 1).toString();
            return `${major}.${minor}.0`;
        }
        let makeZero = revisionLen - revisionStrLen;
        let zeroStr = '';
        while (makeZero--) {
            zeroStr += '0';
        }
        nextVersion = zeroStr + revisionStr;
        return sementicToOrsay(`${major}.${minor}.${nextVersion}`);
    }
}

function getValidOrsayConfigData(configPath: string) {
    console.log(configPath);
    if (!isFileExist(configPath)) {
        // userconf.json is not exist
        return null;
    }
    // userconf.json is already exist
    let userConfigData = JSON.parse(fs.readFileSync(configPath));

    if (!userConfigData.hasOwnProperty('orsay')) {
        // userconf.json doesn't have orsay data
        return null;
    }

    let orsayData = userConfigData.orsay;
    if (!isValidString(`name`)) {
        // name is invalid
        return null;
    }
    if (!isValidString(`thumbicon`)) {
        // thumbicon is invalid
        return null;
    }
    if (!isValidString(`bigthumbicon`)) {
        // bigthumbicon is invalid
        return null;
    }
    if (!isValidString(`listicon`)) {
        // listicon is invalid
        return null;
    }
    if (!isValidString(`biglisticon`)) {
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

function validateOrsayVersion(version: string) {
    let temp = version.split(`.`);
    let i = 0;
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

function isValidString(data: string) {
    if (typeof data !== 'string' || data.length <= 0) {
        return false;
    }
    return true;
}

function sementicToOrsay(sementicVersion: string) {
    const MINOR_LENGTH = 2;
    const REVISION_LENGTH = 3;

    let temp = sementicVersion.split(`.`);

    if (temp.length < REVISION_LENGTH) {
        return sementicVersion;
    }

    let major = temp[0];
    let minor = temp[1];
    let revision = temp[2];

    minor = '000000' + temp[1];
    revision = '000000' + temp[2];

    minor =
        temp[1].length > MINOR_LENGTH
            ? temp[1]
            : minor.substr(Math.max(minor.length - MINOR_LENGTH, MINOR_LENGTH));

    revision =
        temp[2].length > REVISION_LENGTH
            ? temp[2]
            : revision.substr(
                  Math.max(revision.length - REVISION_LENGTH, REVISION_LENGTH)
              );

    revisionLength = revision.length;
    return major + '.' + minor + revision;
}

async function getConfirmAskData(userData: UserInputData) {
    displayData(userData);

    let ask = [
        {
            type: `confirm`,
            name: `isCorrectInfo`,
            message: `"userconf.json" is already exist. Do you want to use this data?`,
            default: true
        }
    ];

    let answer = await inquirer.prompt(ask);
    return answer.isCorrectInfo;
}

async function askUserData(
    cordovaConf: CordovaConfigData,
    userData: UserInputData,
    versionOnly: boolean
) {
    let ask = [];
    if (versionOnly) {
        const currentVersion = userData.version;
        const updateVersion = getNextVersion(currentVersion);
        ask = [
            {
                type: `input`,
                name: `version`,
                message: `current version is ${currentVersion}. Application version: `,
                default: updateVersion,
                validate: function(input: string) {
                    return /^[0-9]+\.[0-9]+$/.test(input)
                        ? true
                        : `invalid version string for orsay platform`;
                }
            }
        ];
        let answer = await inquirer.prompt(ask);
        return answer;
    } else {
        ask = [
            {
                type: `input`,
                name: `name`,
                message: `What's the application's name?`,
                default: cordovaConf.name,
                validate: function(input: string) {
                    return /^[a-zA-Z][^~!\.\;\\\/\|\"\'@\#$%<>^&*\()\-=+_\’\n\t\s]*$/.test(
                        input
                    )
                        ? true
                        : `invalid name for orsay platform`;
                }
            },
            {
                type: `list`,
                name: `resolution`,
                message: `Which resolution does your application developed for?`,
                default: `960x540`,
                choices: [`960x540`, `1280x720`, `1920x1080`]
            },
            {
                type: `list`,
                name: `category`,
                message: `What's the application's category?`,
                choices: [
                    `VOD`,
                    `sports`,
                    `game`,
                    `lifestyle`,
                    `information`,
                    `education`
                ]
            },
            {
                type: `input`,
                name: `version`,
                message: `Application Version(Valid RegExp: ^[0-9]+.[0-9]+$)`,
                default: sementicToOrsay(cordovaConf.version),
                validate: function(input: string) {
                    return /^[0-9]+\.[0-9]+$/.test(input)
                        ? true
                        : `invalid version string for orsay platform`;
                }
            },
            {
                type: `input`,
                name: `thumbicon`,
                message: `ThumbIcon path (default is 'img/logo.png')`,
                default: `img/logo.png`,
                validate: function(input: string) {
                    return typeof input === `string`
                        ? true
                        : `invalid iconpath`;
                }
            },
            {
                type: `input`,
                name: `bigthumbicon`,
                message: `BigThumbIcon path (default is 'img/logo.png')`,
                default: `img/logo.png`,
                validate: function(input: string) {
                    return typeof input === `string`
                        ? true
                        : `invalid iconpath`;
                }
            },
            {
                type: `input`,
                name: `listicon`,
                message: `ListIcon path (default is 'img/logo.png')`,
                default: `img/logo.png`,
                validate: function(input: string) {
                    return typeof input === `string`
                        ? true
                        : `invalid iconpath`;
                }
            },
            {
                type: `input`,
                name: `biglisticon`,
                message: `BigListIcon path (default is 'img/logo.png')`,
                default: `img/logo.png`,
                validate: function(input: string) {
                    return typeof input === `string`
                        ? true
                        : `invalid iconpath`;
                }
            },
            {
                type: `input`,
                name: `description`,
                message: `Application Description`,
                default: utils.trim(cordovaConf.description)
            },
            {
                type: `input`,
                name: `authorName`,
                message: `Author's name`,
                default: cordovaConf.authorName
            },
            {
                type: `input`,
                name: `authorEmail`,
                message: `Author's email`,
                default: cordovaConf.authorEmail
            },
            {
                type: `input`,
                name: `authorHref`,
                message: `Author's IRI(href)`,
                default: cordovaConf.authorHref
            }
        ];

        let answer = await inquirer.prompt(ask);
        let result = answer;
        let temp = result.resolution.split(`x`);
        result.resWidth = parseInt(temp[0], 10);
        result.resHeight = parseInt(temp[1], 10);

        return result;
    }
}

function displayData(userData: UserInputData) {
    console.log(``);
    console.log(`      > [ Stored Information ]`);
    console.log(`      > name        : ${userData.name}`);
    console.log(`      > resolution  : ${userData.resolution}`);
    console.log(`      > category    : ${userData.category}`);
    console.log(`      > version     : ${userData.version}`);
    console.log(`      > description : ${userData.description}`);
    console.log(``);
}

function prepareDirectory(directory: string) {
    mkdirp.sync(directory);
}

function getManualOrsayConfData(platformsData: object[]) {
    let i = 0;
    let manualOrsayConfData = {};
    if (platformsData) {
        for (i = 0; i < platformsData.length; i++) {
            if (platformsData[i].$.name === PLATFORM_ORSAY) {
                delete platformsData[i].$;
                manualOrsayConfData = utils.trim(
                    js2xmlparser('platform', platformsData[i], {
                        declaration: { include: false },
                        attributeString: '$'
                    }).replace(/<(\/?platform)>/gim, '')
                );
            }
        }
    }
    return manualOrsayConfData;
}

function buildProject(
    success: any,
    error: any,
    dest: string,
    userData: UserInputData,
    data: TargetPrepareData,
    platformRepos: string
) {
    const scripts = data.scripts;
    copySrcToDest(dest, scripts) || (error && error());
    buildPlatformAdditions(platformRepos, dest) || (error && error());
    replaceTemplates(dest, userData) || (error && error());
    console.log(`Prepared at ${dest}`);

    // warning for existing meta tag for csp setting
    const targetFile = path.join(path.resolve(PREPARE_DIRECTORY), INDEX_HTML);
    let target = fs.readFileSync(targetFile, {
        encoding: `utf8`
    });

    if (
        target.match(
            /(<meta.*)(http-equiv)(.*=*.)("Content-Security-Policy"|'Content-Security-Policy')/
        )
    ) {
        console.log(
            `\nWARNING!!!!! REMOVE meta tag for csp setting in the "index.html"`
        );
        console.log(
            `It is not supported in this platform. It would be caused abnormal operation.`
        );
        console.log(`Please confirm your file : ${targetFile}`);
    }

    saveUserConfigFile(USERCONFIG_PATH, userData);
    success && success();
}

function copySrcToDest(dest: string, scripts: TargetDataScript) {
    let wwwSrc = path.resolve(PREPARE_DIRECTORY);
    let cordovaConf = utils.getCordovaConfig();

    prepareDirectory(dest);

    for (let key in scripts) {
        if (scripts.hasOwnProperty(key)) {
            let to = path.join(dest, key);
            let from = path.resolve(scripts[key]);
            shelljs.cp(`-f`, from, to);

            if (!fs.existsSync(from)) {
                throw Error(`cordova.js, toast.js file are not exist.`);
            }
        }
    }

    shelljs.cp(`-rf`, path.join(wwwSrc, `*`), dest);

    if (cordovaConf.contentSrc !== INDEX_HTML) {
        if (fs.existsSync(path.join(dest, INDEX_HTML))) {
            grunt.log.error(
                "Initial content, which is pointed by 'content' tag in the 'config.xml'), is not 'index.html', but another 'index.html' is already exist in the source!"
            );
            return false;
        }
        shelljs.mv(
            path.join(dest, cordovaConf.contentSrc),
            path.join(dest, INDEX_HTML)
        );
    }

    return true;
}

function buildPlatformAdditions(platformRepos: string, dest: string) {
    shelljs.cp('-rf', path.join(platformRepos, PREPARE_DIRECTORY, '*'), dest);
    // hack: copying hidden files(starts with dot) at root('www') to the dest directory.
    // if the dest is not exist, we can copy the platform files without this hack by using this command: cp -rf <PLATFORMREPOS>/www <destDir>
    // But the dest directory has the application files at this moment. So we need to use this hack.
    shelljs.cp('-rf', path.join(platformRepos, PREPARE_DIRECTORY, '.*'), dest);
    return true;
}

function replaceTemplates(dest: string, userData: object) {
    let files = fs.readdirSync(dest);
    for (let i = 0; i < files.length; i++) {
        let fileName = files[i];
        if (fileName.match(/\.tmpl$/)) {
            let tmplFilePath = path.join(dest, fileName);
            let destFilePath = path.join(dest, fileName.replace(/\.tmpl$/, ``));
            let template = fs.readFileSync(tmplFilePath, {
                encoding: `utf8`
            });
            let rendered = mustache.render(template, userData);
            fs.writeFileSync(destFilePath, rendered, {
                encoding: `utf8`
            });
            shelljs.rm(path.join(dest, fileName));
        }
    }
    return true;
}

function isFileExist(filePath: string) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (e) {
        return false;
    }
}
