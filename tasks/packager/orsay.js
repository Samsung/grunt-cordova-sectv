var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');
var shelljs = require('shelljs');
var mustache = require('mustache');
var grunt = require('grunt');
var jszip = require('jszip');

function semVer2OrsayVer(semver) {
    var LEN_MINOR = 2;
    var LEN_REV = 3;
    var tmp = semver.split('.');
    var major = tmp[0];
    var minor = '000000'+tmp[1];
    minor = minor.substr(Math.max(minor.length-LEN_MINOR,0));
    var rev = '000000'+tmp[2];
    rev = rev.substr(Math.max(rev.length-LEN_MINOR,0));
    return major + '.' + minor + rev;
}

module.exports = {
    build: function (successCallback, errorCallback, wwwSrc, dest, platformRepos) {
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
            type: 'list',
            name: 'resolution',
            message: 'Which resolution does your application deveoped for?',
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
                return /^[0-9]+\.[0-9]+$/.test(input) ? true : "invalid version string for orsay platform";
            }
        }, {
            type: 'input',
            name: 'description',
            message: 'Application Description',
            default: 'Web application for Samsung Legacy Smart TV platform'
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

        var config = {};
        inquirer.prompt(choice, function (answers) {
            config = answers;
            var tmp = config.resolution.split('x');
            config.resWidth = parseInt(tmp[0], 10);
            config.resHeight = parseInt(tmp[1], 10);

            //cleanDest() || (errorCallback && errorCallback());
            copySrcToDest() || (errorCallback && errorCallback());
            buildPlatformAdditions() || (errorCallback && errorCallback());

            grunt.log.write('Built at ' + dest);
            successCallback && successCallback();
        });

        // function cleanDest() {
        //     shelljs.rm('-rf', dest);
        //     return true;
        // }
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
            if(cordovaConf.contentSrc !== "index.html") {
                if(fs.existsSync(path.join(dest, "index.html"))) {
                    grunt.log.error("Initial content, which is pointed by \'content\' tag in the 'config.xml'), is not 'index.html', but another 'index.html' is already exist in the source!");
                    return false;
                }
                shelljs.mv(path.join(dest, cordovaConf.contentSrc), path.join(dest, "index.html"));
            }
            return true;
        }

        function buildPlatformAdditions() {
            shelljs.cp('-rf', path.join(platformRepos, 'www', '*'), dest);

            // replace config.xml template with actual configuration
            replaceTemplate('config.xml');
            
            // replace widget.info template with actual configuration
            replaceTemplate('widget.info');

            // replace .project template with actual configuration
            // .project is hidden file in linux
            replaceTemplate('project', true);

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
    package: function (successCallback, errorCallback, wwwSrc, dest, platformRepos) {
        // TODO: zip the built application to make package
        
        //shelljs.cp('-rf', './www/*', dest);
        //make zip file
        // var zip = new JSZip();
        // zip.folder("packages");

        // platformRepos = path.resolve(platformRepos);
        // shelljs.cp('-rf', path.join(platformRepos, 'www', '*'), dest);

        // var result = zip.generate({type : "blob"});
        // saveAs(result, cordovaConf.name+".zip");
    }
};