/*
* gulpfile.js
*/

const BUILD_FILENAME = 'bundle.js'

const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('check', function(done) {
  console.dir("argument");
  console.dir(argv);
  done();
});

gulp.task('watch', function(done) {
  gulp.watch(['./src/**/*.js'], { ignoreInitial: false }, gulp.task('concat'));
});

// jsのビルド
gulp.task('concat', function(done) {
  return gulp.src(['./src/**/*.js'], { sourcemaps: true })
    .pipe(concat(BUILD_FILENAME))
    .pipe(gulp.dest('./', { sourcemaps: true }));
});

gulp.task('build', gulp.series('concat'));
gulp.task('default', gulp.series('build'));
