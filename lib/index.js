'use strict';

var exit = process.exit.bind(process);

var fs = require('fs'),
    path = require('path'),
    util = require('gulp-util'),
    filter = require('gulp-filter'),
    sequence = require('gulp-sequence');

function errorHandler(e) {
  util.log(util.colors.red(e.message));
  this.emit('end');
}

function is_dir(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isDirectory();
}

function hook(chain, set) {
  if (set) {
    (Array.isArray(set) ? set : [set])
      .forEach(function(task) {
        chain = task(chain)
          .on('error', errorHandler);
      });
  }

  return chain;
}

module.exports = function(options) {
  options = options || {};

  var gulp = options.gulp;

  if (!gulp) {
    util.log(util.colors.red('Missing the main `gulp` instance to work'));
    exit(1);
  }

  var base = typeof util.env.base === 'string' ? util.env.base : 'default',
      base_dir = path.join(process.cwd(), 'src', options.cwd || '', (util.env.base || options.base) !== false ? base : '');

  if (!is_dir(base_dir)) {
    util.log(util.colors.red('The specified base directory `' + base + '` is missing'));
    exit(1);
  }

  var isBuild = options.build,
      sources = options.files || {};

  sources.dest = sources.dest || '';
  sources.views = sources.views || {};
  sources.fonts = sources.fonts || {};
  sources.styles = sources.styles || {};
  sources.images = sources.images || {};
  sources.scripts = sources.scripts || {};

  options.paths = {
    fonts: {
      on: path.join(base_dir, sources.fonts.src || 'fonts', '**/*.{ttf,otf,eot,woff,woff2,svg}'),
      cwd: path.join(base_dir, sources.fonts.src || 'fonts'),
      dest: sources.fonts.dest || 'fonts',
      glob: '**/*.{ttf,otf,eot,woff,woff2,svg}'
    },
    images: {
      on: path.join(base_dir, sources.images.src || 'images', '**/*.{jpg,jpeg,png,svg}'),
      cwd: path.join(base_dir, sources.images.src || 'images'),
      dest: sources.images.dest || 'img',
      glob: '**/*.{jpg,jpeg,png,svg}'
    },
    styles: {
      on: [
        path.join(base_dir, '_site/**/*.{variables,overrides}'),
        path.join(base_dir, sources.styles.src || 'styles', '**/*.less'),
        path.join(base_dir, 'env.yml')
      ],
      cwd: path.join(base_dir, sources.styles.src || 'styles'),
      dest: sources.styles.dest || 'css',
      glob: '**/*.less'
    },
    scripts: {
      on: path.join(base_dir, sources.scripts.src || 'scripts', '**/*.{coffee,litcoffee}'),
      cwd: path.join(base_dir, sources.scripts.src || 'scripts'),
      dest: sources.scripts.dest || 'js',
      glob: '**/*.{coffee,litcoffee}'
    },
    views: {
      on: [
        path.join(base_dir, sources.views.src || 'views', '**/*.jade'),
        path.join(process.cwd(), 'data/*.yml')
      ],
      cwd: path.join(base_dir, sources.views.src || 'views'),
      dest: sources.views.dest || '',
      glob: '**/*.jade'
    },
    data: {
      cwd: path.join(process.cwd(), 'data'),
      glob: '*.yml'
    },
    dest: path.join(process.cwd(), sources.dest || 'generated'),
    env: path.join(base_dir, 'env.yml')
  };

  options.env = util.env;

  var copyTask = require('./tasks/copy');

  var rainbow = {
    clean: require('./tasks/clean')(options),
    fonts: copyTask(options, 'fonts'),
    images: copyTask(options, 'images'),
    scripts: require('./tasks/scripts')(options),
    install: require('./tasks/install')(options),
    server: require('./tasks/server')(options),
    styles: require('./tasks/styles')(options),
    vendor: require('./tasks/vendor')(options),
    views: require('./tasks/views')(options)
  };

  var main = [],
      tasks = ['clean', 'install', 'vendor'];

  ['fonts', 'images', 'styles', 'scripts', 'views']
    .forEach(function(task) {
      if (is_dir(options.paths[task].cwd)) {
        tasks.push(task);
      }
    });

  if (!(options.server === false || isBuild)) {
    tasks.push('server');
  }

  tasks
    .forEach(function(task) {
        var files = options.paths[task],
            callback = rainbow[task];

        if (callback) {
          main.push('rainbow:' + task);

          if (typeof callback === 'function') {
            gulp.task('rainbow:' + task, callback);
          } else {
            gulp.task('rainbow:' + task, function() {
              var chain = hook(gulp.src(callback.src)
                .pipe(filter(['**', '!**/_*/**'])), sources[task].before);

              if (callback.pipe) {
                (Array.isArray(callback.pipe) ? callback.pipe : [callback.pipe])
                  .forEach(function(step) {
                    chain = chain.pipe(step())
                      .on('error', errorHandler);
                  });
              }

              return hook(chain, sources[task].after)
                .pipe(gulp.dest(callback.dest));
            });
          }

          if (files && files.on && !isBuild) {
            gulp.watch(files.on, ['rainbow:' + task]);
          }
        } else {
          util.log(util.colors.red('Unknown rainbow-task `' + task + '`'));
          exit(1);
        }
      });

  gulp.task('rainbow', sequence.use(gulp).apply(null, main));
};
