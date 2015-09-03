var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');
var shelljs = require('shelljs');
var mustache = require('mustache');
var grunt = require('grunt');
var zipdir = require('zip-dir');

module.exports = {
    build: function (successCallback, errorCallback, wwwSrc, dest, platformRepos, scripts) {
        console.log("\nStart Building Legacy Samsung Smart TV Platform......");

        // file path
        wwwSrc = path.resolve(wwwSrc);
        dest = path.resolve(dest);
        platformRepos = path.resolve(platformRepos);

        // script
        // var cordovaSrc = path.resolve(scripts['cordova.js']);
        var toastSrc = path.resolve(scripts['toast.js']);

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
            inputNewData : function(){
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
                    default: orsayUtil.semVer2OrsayVer(cordovaConf.version),
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

                inquirer.prompt(choice, function (answers) {
                    var config = answers;

                    var tmp = config.resolution.split('x');
                    config.resWidth = parseInt(tmp[0], 10);
                    config.resHeight = parseInt(tmp[1], 10);

                    userconf.setUserConf(config);
                    orsayUtil.buildProject();
                    fs.writeFileSync(userconf.filepath, JSON.stringify(config), {encoding: 'utf8'});
                });
            }
        };

        var orsayUtil = {
            semVer2OrsayVer : function(semver) {
                var LEN_MINOR = 2;
                // var LEN_REV = 3;
                var tmp = semver.split('.');
                var major = tmp[0];
                var minor = '000000'+tmp[1];
                minor = minor.substr(Math.max(minor.length-LEN_MINOR,0));
                var rev = '000000'+tmp[2];
                rev = rev.substr(Math.max(rev.length-LEN_MINOR,0));

                return major + '.' + minor + rev;
            },
            copySrcToDest : function() {
                var tmp = dest.split(path.sep);
                
                var curPath = tmp[0];
                for(var i=1; i<tmp.length; i++) {
                    curPath = path.join(curPath, tmp[i]);
                    !fs.existsSync(curPath) && fs.mkdirSync(curPath);
                }

                // // copy cordova.js
                // shelljs.cp('-rf', cordovaSrc, dest);

                // copy toast.js
                fs.exists(toastSrc, function(exists){
                    if(exists) shelljs.cp('-rf', toastSrc, dest);
                    else console.log('\n\ncan\'t find toast.js at\n'+toastSrc);
                }); 

                shelljs.cp('-rf', path.join(wwwSrc, '*'), dest);

                if(cordovaConf.contentSrc !== "index.html") {
                    if(fs.existsSync(path.join(dest, "index.html"))) {
                        grunt.log.error("Initial content, which is pointed by \'content\' tag in the 'config.xml'), is not 'index.html', but another 'index.html' is already exist in the source!");
                        return false;
                    }
                    shelljs.mv(path.join(dest, cordovaConf.contentSrc), path.join(dest, "index.html"));
                }

                return true;
            },
            buildPlatformAdditions : function() {
                shelljs.cp('-rf', path.join(platformRepos, 'www', '*'), dest);

                // replace config.xml template with actual configuration
                this.replaceTemplate('config.xml');
                
                // replace widget.info template with actual configuration
                this.replaceTemplate('widget.info');

                // replace .project template with actual configuration
                // .project is hidden file in linux
                this.replaceTemplate('project', true);

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

                console.log('Built at ' + dest);
                successCallback && successCallback();
            }
        };

        if(fs.existsSync(userconf.filepath)){
            // userconf.json already exists
            var cacheAsk = [{
                type: 'confirm',
                name: 'cache',
                message: 'Already have [userconf.json], Do you want to use this data?'
            }];

            inquirer.prompt(cacheAsk, function(answers){
                if(answers.cache){
                    // use cache data
                    var data = fs.readFileSync(userconf.filepath);
                    data = JSON.parse(data);
                    userconf.setUserConf(data);
                    orsayUtil.buildProject();
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
        console.log("\nStart packaging Legacy Samsung Smart TV Platform......");

        build = path.resolve(build);
        dest = path.resolve(dest);

        fs.mkdir(dest, function(){
            zipdir(build, {saveTo: path.join(dest, "package.zip")}, function(err, buffer){
                console.log('Packaged at ' + dest);
                successCallback && successCallback();        
            });
        });
    }
};
