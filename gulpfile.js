const gulp = require("gulp");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const jsonConcat = require('gulp-json-concat');
const markdown = require('gulp-markdown');
const map = require('map-stream');
const RadarMarkdownParser = require('./utils/parser');
const gulpSequence = require('gulp-sequence');
const path = require('path');
const Vinyl = require('vinyl');
const data = [];

// Thanks to https://stackoverflow.com/questions/23230569/how-do-you-create-a-file-from-a-string-in-gulp/24451738
function string_src(filename, string) {
    const src = require('stream').Readable({
        objectMode: true
    });
    src._read = function () {
        this.push(new Vinyl({
            cwd: process.cwd(),
            base: './',
            path: filename,
            contents: new Buffer(string)
        }));
        this.push(null);
    };
    return src;
}

gulp.task('write', function () {
    return string_src('output.json', JSON.stringify(data, null, 2))
    .pipe(gulp.dest('data/'));
});

gulp.task('build', function () {
    return gulp.src(['./docs/*.md'])
        .pipe(map(function (file, done) {
            data.push(new RadarMarkdownParser(file.contents.toString('utf8'), path.basename(file.path)));
            done();
        }))
        .pipe(gulp.dest('./dist/temp'));
});

gulp.task('md', gulpSequence('build', 'write'));

gulp.task("scripts", () => {
  gulp
    .src(["app/*.js"])
    .pipe(
      babel({
        presets: ["env"]
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});
// Copy other files
gulp.task("copy", () => {
  gulp.src("app/*.css").pipe(gulp.dest("dist"));
  gulp.src("app/*.html").pipe(gulp.dest("dist"));
  gulp.src("app/assets/**/*").pipe(gulp.dest("dist/assets"));
});

// concat JSON files
gulp.task('merge-json', () => {
  gulp.src('techstack/*.json')
    .pipe(jsonConcat('radar-data.json', function (data) {
      var finalObj = {};
      finalObj.entries = Object.values(data);
      return new Buffer(JSON.stringify(finalObj, null, '\t'));
    }))
    .pipe(gulp.dest('data/'));
});
// convert markdown to html
gulp.task('mh', () =>
    gulp.src('data/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('app/templates'))
);

gulp.task("copy-data", () => {
  gulp.src("data/*.json").pipe(gulp.dest("functions/data"));
});

gulp.task("default", ["scripts", "copy", "copy-data"], () => {});