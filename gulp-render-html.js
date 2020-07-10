// GULP plugin to render the html from handlebars

var Transform = require('stream').Transform;
var utils = require('./utils');

module.exports = function (data = {}) {
    var transformStream = new Transform({ objectMode: true });
    transformStream._transform = function (file, encoding, callback) {
        utils.renderHtml(file.path, data, function (err, html) {
            if (html) {
                file.contents = Buffer.from(html || '', encoding);
            }

            callback(err, file);
        });
    };

    return transformStream;
};
