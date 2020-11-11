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

module.exports = function(grunt) {
    grunt.registerMultiTask('sectv-prepare', 'prepare sectv apps', function() {
        var platformName = this.target;

        var packager = require('./packager/' + platformName);
        var done = this.async();

        // prepare: function(successCallback, errorCallback, platformName, data)
        packager.prepare(function () {
            done();
        }, function () {
            done();
        }, this.target, this.data);
    });
};
