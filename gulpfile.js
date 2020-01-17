/**
 * 压缩构建产物
 */
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const terser = require('terser');
const gulpTerser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');

function minifyHtml() {
  return new Promise((resolve, reject) => {
    gulp
      .src('public/**/*.html')
      .pipe(
        htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          minifyJS: code => {
            const { error, code: resultCode } = terser.minify(code);
            if (error) {
              return reject(error);
            }
            return resultCode;
          },
          minifyCSS: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
        }),
      )
      .pipe(gulp.dest('public'))
      .on('error', reject)
      .on('finish', resolve);
  });
}

function minifyJS() {
  return gulp
    .src(['public/**/*.js', '!public/**/*.min.js'])
    .pipe(gulpTerser())
    .pipe(gulp.dest('public'));
}

function minifyCss() {
  return gulp
    .src(['public/**/*.css', '!public/**/*.min.css'])
    .pipe(cleanCSS())
    .pipe(gulp.dest('public'));
}

gulp.task('default', gulp.parallel(minifyHtml, minifyJS, minifyCss));
