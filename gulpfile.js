const gulp = require("gulp");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
var jsonConcat = require('gulp-json-concat');

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

gulp.task("copy-data", () => {
  gulp.src("data/*.json").pipe(gulp.dest("functions/data"));
});

gulp.task("default", ["scripts", "copy", "copy-data"], () => {});