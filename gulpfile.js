"use strict";

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');
const htmlclean = require('gulp-htmlclean');
const babel = require('gulp-babel');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const rename = require('gulp-rename');
const minimist = require('minimist');
const handlebars = require('gulp-compile-handlebars');
const clean = require('gulp-clean');
const deleteEmpty = require('delete-empty');
const moment = require('moment');
const ftp = require('vinyl-ftp');
var log = require('fancy-log')

const browserSync = require('browser-sync').create();

let options = {
    dest: './dist',
    src: './www',
    env: 'production',
    config: './www/config.json'
};

// get gulp arguments
options = minimist(process.argv.slice(2), {
    string: [
        'dest',
        'src',
        'env',
        'config'
    ],
    alias: {
        dest: ['o', 'd'],
        src: ['i', 's'],
        env: 'e',
        config: 'c'
    },
    default: options
});

let isDev = options.env == 'development' || options.env == 'dev';
const isProd = options.env == 'production' || options.env == 'prod';

const configs = getConfigs();

function getConfigs() {
    let configs;
    if (options.config) {
        try {
            configs = JSON.parse(fs.readFileSync(path.join(__dirname, options.config)).toString())
        } catch (err) {
            log.error(err);
        }
    } else {
        log.warn('configs not found');
        return;
    }

    if (!configs
        || !configs.hbs) {
        log.warn('Wrong properties found in configs. Please read the documentation.');
        return;
    }

    return configs;
}

gulp.task('clean', function () {
    return gulp.src(`${options.dest}*`, {
        read: false,
    }).pipe(clean({}));
});

gulp.task('copy', function (done) {
    if (isDev) {
        return gulp.src(options.src + '/**/*')
            .pipe(gulp.dest(options.dest));
    }

    var copyRootFiles = function () {
        return gulp.src(
            [
                options.src + '/**/*',
                '!' + options.src + '/**/*.hbs',
                '!' + options.src + '/**/*.css',
                '!' + options.src + '/**/*.js',
                '!' + options.src + '/**/*.json',
                options.src + '/**/*.min.js',
                options.src + '/**/*.min.css',
            ])
            .pipe(gulp.dest(options.dest))
    }

    return gulp.series(copyRootFiles, function (seriesDone) {
        deleteEmpty.sync(path.join(__dirname, options.dest));
        seriesDone();
        done();
    })();
});

gulp.task('hbs', function (done) {
    if (!configs) {
        log.warn('No configs found, please check documentation.');
        return done();
    }
    var series = [];
    for (let hbsFileName in configs.hbs) {
        const src = path.join(options.src, hbsFileName) + '.hbs';
        let dest = options.dest;
        if (hbsFileName != 'index') {
            dest = path.join(dest, hbsFileName);
        }

        const handlebarOption = {
            ignorePartials: true,
            batch: [path.join(options.src, configs.partials || './partials')],
            helpers: require('./utils/hbs-helpers')
        };
        const contextData = configs.hbs[hbsFileName];
        contextData.copyrightYear = moment().format('YYYY');
        contextData.isProd = isProd;

        var hbsGulpFun = function () {
            if (isDev) {
                return gulp.src(src)
                    .pipe(handlebars(contextData, handlebarOption))
                    .pipe(gulpif('*.hbs', rename('index.html')))
                    .pipe(gulp.dest(dest));
            }

            return gulp.src(src)
                .pipe(handlebars(contextData, handlebarOption))
                .pipe(useref({}))
                .pipe(gulpif(['*.css', '!*.min.css'], rev()))
                .pipe(gulpif(['*.js', '!*.min.js'], rev()))
                .pipe(revReplace())
                .pipe(gulpif(['*.js', '!*.min.js'], babel({
                    presets: ['@babel/env']
                })))
                .pipe(gulpif(['*.js', '!*.min.js'], uglify()))
                .pipe(gulpif(['*.css', '!*.min.css'], minifyCss()))
                .pipe(htmlclean())
                .pipe(gulpif('*.hbs', rename('index.html')))
                .pipe(gulp.dest(dest));
        }

        hbsGulpFun.displayName = src;
        series.push(hbsGulpFun);
    }

    return gulp.series(series, function hbsSeries(seriesDone) {
        seriesDone();
        done();
    })();
});

gulp.task('build', gulp.series('clean', 'copy', 'hbs'));

gulp.task('deploy', function (done) {
    const ftpInfo = configs.ftp;
    if (!ftpInfo
        || !ftpInfo.host) {
        log.warn(`FTP configs are missing, please add into - ${options.config}`)
        done();
        return;
    }

    var conn = ftp.create({
        host: ftpInfo.host,
        user: ftpInfo.user,
        password: ftpInfo.password,
        parallel: 10,
        log: log
    });

    return gulp.src(options.dest, { buffer: false })
        .pipe(conn.dest(ftpInfo.folder || '/public_html'));
});

gulp.task('default', gulp.series('clean', 'copy', 'hbs', function watch(cb) {
    browserSync.init({
        server: options.dest
    });

    gulp.watch(options.src, gulp.parallel('copy', 'hbs', function browserSyncReload(done) {
        browserSync.reload();
        done();
    }));
}));
