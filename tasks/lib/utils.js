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

var fs = require('fs');
var xml2js = require('xml2js');

function trim(str) {
    return (str + '').replace(/^\s+|\s+$/g, '');
}

module.exports = {
    trim: trim,
    getCordovaConfig: async function(filepath) {
        if (!filepath) {
            filepath = './config.xml';
        }

        var confXml = fs.readFileSync(filepath);
        var conf = null;
        xml2js.parseString(
            confXml,
            {
                async: false
            },
            function(err, result) {
                conf = result;
            }
        );

        return {
            raw: conf,
            contentSrc: conf.widget.content[0].$.src,
            version: conf.widget.$.version,
            name: conf.widget.name[0],
            description: conf.widget.description,
            authorName: trim(conf.widget.author[0]._ || ''),
            authorEmail: trim(conf.widget.author[0].$.email || ''),
            authorHref: trim(conf.widget.author[0].$.href || ''),
            platform: conf.widget.platform
        };
    }
};
