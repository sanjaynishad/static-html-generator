const gulp = require('gulp');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');
const htmlclean = require('gulp-htmlclean');
const babel = require('gulp-babel');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const rimraf = require('rimraf');

// TODO: add execlusions of files
const gulpRenderHtml = require('./gulp-render-html');

// TODO: move these to a config file
var commonHandlebarData = { title: 'Test Site' };
const dest = './dist';
const src = './www';

gulp.task('clean', function (cb) {
    rimraf(dest, {}, cb);
});

gulp.task('copy', function () {
    return gulp.src([src + '/**', '!' + src + '/**/*.html'])
        .pipe(gulp.dest(dest));
});

gulp.task('css', function () {
    return gulp.src(src + '/css/*')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('render-html', function renderHtml() {
    return gulp.src([src + '/**/*.html'])
        .pipe(gulpRenderHtml(commonHandlebarData))
        .pipe(gulp.dest(dest));
});

gulp.task('render-html-prod', function () {
    return gulp.src(src + '/**/*.html')
        .pipe(gulpRenderHtml(commonHandlebarData))
        .pipe(useref({ searchPath: src }))
        .pipe(gulpif('*.css', rev()))
        .pipe(gulpif('*.js', rev()))
        .pipe(revReplace())
        .pipe(gulpif('*.js', babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(htmlclean())
        .pipe(gulp.dest(dest));
});

gulp.task('dev', gulp.series('copy', 'render-html', function (cb) {
    gulp.watch(src, gulp.parallel('copy', 'render-html'));
}));

gulp.task('default', gulp.series('clean', 'render-html-prod'));
