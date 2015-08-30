var fs = require('fs');
var xml2js = require('xml2js');
function trim (str) {
    return (str + "").replace(/^\s+|\s+$/g, '');
}

module.exports = {
    trim: trim,
    getCordovaConfig: function(filepath) {
        if(!filepath){
            filepath = './config.xml';
        }
        
        var confXml = fs.readFileSync(filepath);
        var conf = null;
        xml2js.parseString(confXml, {
            async: false
        }, function(err, result) {
            conf = result;
        });
        //console.log('conf: ' + JSON.stringify(conf));
        return {
            raw: conf,
            contentSrc: conf.widget.content[0].$.src,
            version: conf.widget.$.version,
            name: conf.widget.name[0],
            description: conf.widget.description,
            authorName: trim(conf.widget.author[0]._ || ""),
            authorEmail: trim(conf.widget.author[0].$.email || ""),
            authorHref: trim(conf.widget.author[0].$.href || "")
        };
    }
};