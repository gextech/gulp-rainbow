'use strict';

var exit = process.exit.bind(process);

var fs = require('fs'),
    path = require('path'),
    util = require('gulp-util'),
    filter = require('gulp-filter'),
    rename = require('gulp-rename'),
    sequence = require('gulp-sequence');

function errorHandler(e) {
  util.log(util.colors.red(e.message));
  this.emit('end');
}

module.exports = function(options) {
  options = options || {};

  var gulp = options.gulp;

  if (!gulp) {
    util.log(util.colors.red('Missing the main `gulp` instance to work'));
    exit(1);
  }

  var base = typeof util.env.base === 'string' ? util.env.base : 'default',
      base_dir = path.join(process.cwd(), 'src', options.cwd || '', base);

  if (!(fs.existsSync(base_dir) && fs.statSync(base_dir).isDirectory())) {
    util.log(util.colors.red('The specified base directory `' + base + '` is missing'));
    exit(1);
  }

  options.paths = {
    fonts: {
      on: path.join(base_dir, 'fonts/**/*.{ttf,otf,eot,woff,woff2,svg}'),
      cwd: path.join(base_dir, 'fonts'),
      glob: '**/*.{ttf,otf,eot,woff,woff2,svg}'
    },
    images: {
      on: path.join(base_dir, 'images/**/*.{jpg,jpeg,png,svg}'),
      cwd: path.join(base_dir, 'images'),
      glob: '**/*.{jpg,jpeg,png,svg}'
    },
    styles: {
      on: [
        path.join(base_dir, '_site/**/*.{variables,overrides}'),
        path.join(base_dir, 'styles/**/*.less'),
        path.join(base_dir, 'env.yml')
      ],
      cwd: path.join(base_dir, 'styles'),
      glob: '**/*.less'
    },
    views: {
      on: [
        path.join(base_dir, 'views/**/*.jade'),
        path.join(process.cwd(), 'data/*.yml')
      ],
      cwd: path.join(base_dir, 'views'),
      glob: '**/*.jade'
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
    clean: require('./tasks/clean')(options),
    fonts: require('./tasks/fonts')(options),
    images: require('./tasks/images')(options),
    install: require('./tasks/install')(options),
    server: require('./tasks/server')(options),
    styles: require('./tasks/styles')(options),
    vendor: require('./tasks/vendor')(options),
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
              var chain = gulp.src(callback.src)
                .pipe(filter(['*', '!_']))
                .on('error', errorHandler);

              if (callback.pipe) {
                (Array.isArray(callback.pipe) ? callback.pipe : [callback.pipe])
                  .forEach(function(step) {
                    chain = chain.pipe(step());
                  });
              }

              if (callback.file) {
                chain = chain.pipe(rename(function(src) {
                  for (var prop in callback.file) {
                    src[prop] = callback.file[prop];
                  }
                }));
              }

              return chain
                .pipe(gulp.dest(callback.dest));
            });
          }

          if (files && files.on) {
            gulp.watch(files.on, ['rainbow:' + task]);
          }
        } else {
          util.log(util.colors.red('Unknown rainbow-task `' + task + '`'));
          exit(1);
        }
      });

  gulp.task('rainbow', sequence.use(gulp).apply(null, main));
};
