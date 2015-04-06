'use strict';

var exit = process.exit.bind(process);

var fs = require('fs'),
    path = require('path'),
    util = require('gulp-util'),
    filter = require('gulp-filter');

function errorHandler(e) {
  util.log(util.colors.red(e.message));
  this.emit('end');
}

module.exports = function(options) {
  options = options || {};

  var gulp = options.gulp || require('gulp');

  var base = typeof util.env.base === 'string' ? util.env.base : 'default',
      base_dir = path.join(process.cwd(), 'src', options.cwd || '', base);

  if (!(fs.existsSync(base_dir) && fs.statSync(base_dir).isDirectory())) {
    util.log('The specified base directory `' + util.colors.cyan(base) + '` is missing.');
    exit(1);
  }

  options.paths = {
    sprites: {
      cwd: path.join(base_dir, 'sprites'),
      glob: '*.png'
    },
    images: {
      cwd: path.join(base_dir, 'images'),
      glob: '*.{jpg,jpeg,png,svg}'
    },
    styles: {
      cwd: path.join(base_dir, 'styles'),
      glob: '*.less'
    },
    views: {
      cwd: path.join(base_dir, 'views'),
      glob: '*.jade'
    },
    data: {
      cwd: path.join(process.cwd(), 'data'),
      glob: '*.yml'
    },
    dest: path.join(process.cwd(), 'generated'),
    env: path.join(base_dir, 'env.yml')
  };

  options.env = util.env;

  var rainbow = {
    bower: require('./tasks/bower')(options),
    clean: require('./tasks/clean')(options),
    server: require('./tasks/server')(options),
    styles: require('./tasks/styles')(options),
    views: require('./tasks/views')(options)
  };

  var main = [];

  (options.tasks || [])
    .forEach(function(task) {
        var files = options.paths[task],
            callback = rainbow[task];

        if (callback) {
          main.push('rainbow:' + task);


          if (typeof callback === 'function') {
            gulp.task('rainbow:' + task, callback);
          } else {
            gulp.task('rainbow:' + task, function() {
              var task = gulp.src(callback.src);

              if (callback.skip) {
                task = task.pipe(filter(callback.skip));
              }

              if (callback.pipe) {
                (Array.isArray(callback.pipe) ? callback.pipe : [callback.pipe])
                  .forEach(function(step) {
                    task = task.pipe(step());
                  });
              }

              return task
                .on('error', errorHandler)
                .pipe(gulp.dest(callback.dest));
            });
          }

          if (files && files.watch) {
            gulp.watch(files.watch, ['rainbow:' + task]);
          }
        } else {
          util.log(util.colors.red('unknown rainbow-task `' + task + '`'));
          exit(1);
        }
      });

  gulp.task('rainbow', main);
};
