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

'use strict';

var path = require('path');

module.exports = function(grunt) {
    grunt.registerMultiTask('sectv-build', 'build sectv apps', function() {
        var platformName = this.target;

        // path
        var wwwSrc = path.normalize(this.data.src || ('./www'));
        var dest = this.data.dest || path.join('platforms', platformName, 'www');
        var platformRepos = this.data.platformRepos || ('../cordova-sectv-' + platformName);
        var scripts = this.data.scripts;

        var packager = require('./packager/'+platformName);
        var done = this.async();
        packager.build(function () {
            done();
        }, function () {
            done();
        }, wwwSrc, dest, platformRepos, scripts);
    });
};