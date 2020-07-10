const path = require('path');
const exphbs = require('express-handlebars');

const layoutDir = path.join(__dirname, './../www/');
const hbs = exphbs.create({
    extname: '.html',
    layoutsDir: path.join(layoutDir, 'layouts'),
    partialsDir: path.join(layoutDir, 'partials'),
    defaultLayout: 'main',
    helpers: require('./../utils/hbs-helpers'),
});

function renderHtml(fileName, data = {}, callback) {
    hbs.renderView(path.join(fileName), data, function (err, html) {
        if (err) {
            console.log(err);
            return;
        }

        if (typeof callback === 'function') {
            callback(err, html);
        }
    });
}

module.exports = {
    renderHtml: renderHtml
}
