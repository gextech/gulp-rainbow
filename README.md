**Rainbow** is a collection of `gulp` tasks for front-end development.

It leverages on `bower`, `jade`, `less`, `coffee-script` and `semantic-ui` for build our production assets.

Of course you MUST have installed Git and NodeJS (through NVM) before.

## Installation of dependencies

### Mac OSX

1. Install Xcode from the AppStore

2. Install brew http://brew.sh/

    ```bash
    ruby -e "$(curl -fsSL    https://raw.githubusercontent.com/Homebrew/install/master/install)"
    ```

3. Install git

    ```bash
    brew install git
    ```

4. Install NVM
    _Via homebrew:_
    ```bash
    brew install nvm
    ```
    _or via curl:_
    ```bash
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
    ```
5. Install node through nvm (rainbow works with **node v0.10.x** and **v0.12.x**)

    ```bash
    nvm install v0.12
    nvm alias default v0.12
    ```

6. Install gulp

    ```bash
    npm install -g gulp
    ```

### Linux

Make sure you're installing git and nvm only.

Then proceed with the 4-5 steps.


## Dependencies

Since it's a `gulp` plugin you must have a `gulpfile.js` with this:

```js
require('gulp-rainbow')({
  // see options below
});
```

## Methods

Rainbow exposes the `server` subtask for external reuse.

```javascript
gulp.task('server', rainbow.server('public_dir'));
```

## Options

**gulp** (object|required) &mdash; the `gulp` instance to hook-up

```js
// or pass your `gulp` instance
gulp: require('gulp')
```

**prefix** (string|optional) &mdash; if present, it will be used to prefix all the sub-tasks, then returns the `gulp-sequence` callback for external registration.

```javascript
gulp.task('my-custom-task', rainbow({ prefix: 'custom' }));
```

Otherwise the `rainbow` task will be registered.

**params** (object|optional) &mdash; used to expand values within the `files` object.

```javascript
{
  params: {
    foo: 'bar',
  },
  files: {
    dest: 'build/${foo}/public' // will produce build/bar/public
  }
}
```

> Also the current `${base}` is accessible through and cannot be overridden.

**filter** (string|array|optional) &mdash; used to filter-out all subtasks sources.

```javascript
filter: ["!**/private/**"]
```

**bundle** (boolean|object|optional) &mdash; determines if `less` and `coffee-script` should bundle its assets using indexes, i.e. `scripts/foo/index.coffee` would produce `generated/js/foo.js` and `styles/bar/index.less` as `generated/css/bar.css`, etc.

```javascript
// default values (if enabled)
bundle: {
  compact: true
}
```

If `compact` is **false** `foo/index.in` would generate `foo/index.out` directly.

> This feature is disabled by default.

**locals** (object|optional) &mdash; used in jade templates, i.e. formating, mocks, etc.

```javascript
// good!
locals: {
  chance: require('chance').Chance()
}

// view.jade
h3.user.name=chance.name()
```

**server** (boolean|optional) &mdash; if `false`, the server task will be disabled

**proxy** (string|optional) &mdash; used instead of `server` to setup a proxy

```javascript
// custom proxy
proxy: 'localhost:8080'
```

**build** (boolean|optional) &mdash; if `true`, will disable the `server` and `watch` tasks

```js
// using argvs
build: process.argv.indexOf('--build') > -1
```

**files** (object|optional) &mdash; used for setup all the source directories

```js
// rainbow defaults
{
  vendor: 'vendor',
  filter: [],
  bower: '',
  env: 'env.yml',
  dest: 'generated',
  icons: { src: 'icons' },
  views: { src: 'views', dest: '', ext: '.html' },
  fonts: { src: 'fonts', dest: 'fonts' },
  styles: { src: 'styles', dest: 'css' },
  images: { src: 'images', dest: 'img' },
  sprites: { src: 'sprites', dest: 'img' },
  scripts: { src: 'scripts', dest: 'js' }
}
```

The file-extension for `views` can be overridden through the `ext` property.

> Values for `src` must be relative to the current `base` directory

Also, some tasks can use `before` and `after` hooks:

```js
// common gulp plugins
var rename = require('gulp-rename');

// after-hook for generated views
views: {
  after: function(stream) {
    return stream.pipe(rename(function(file) {
      file.extname = '.jsp';
    }));
  }
}
```

**icons** (object|optional) &mdash; options passed to the `icons` task.
Available options:

* `fontName`: (string, defaults to `icons`) the name used to load the icon's font-family in CSS.
* `startUnicode`: (hex, defaults to `0xF000`) the starting charcode for all generated glyphs.
* `normalize`: (boolean, defaults to `true`) whether the glyphs' sizes should be normalized to have the same height (don't disable this unless you know what you're doing).
* `className`: (string, defaults to `icon`) the LESS/CSS classname that will be used along each icon's classname.

    > e.g. if you set it to `foo-icon`, then a `burger` icon would be (in jade) `i.foo-icon.burger`

* `templates`: (object, see defaults below) the configuration for all generated templates.  Each template's config can have the following properties:
> _Warning, setting this option in rainbow will override all of the default templates_

  * `template`: (required) the path to a swig template, receiving the following variables:
    * `fontPath`, `fontName`, `className` directly from the options above.
    * `comments`: A small disclaimer to let developers know that the output file should not be edited.
    * `icons`: An array of icon glyphs, each one being an object with a `name` and `code` (the glyph's hex code).
  * `outputName`: (required) the name of the rendered template
  * `outputDir`: (optional) the path to place the rendered template
  * `fontPath`: (optional) the path to the font files, relative to the outputName (or to the server's root)

  The default templates configuration is as follows:
  ```js
  templates: iconOptions.templates || {
      less: {
        template: 'lib/stubs/icons/template.less', //in rainbow's dir
        outputName: 'icons.less'
      },
      htmlCatalog: {
        template: 'lib/stubs/icons/templateCatalog.html', //in rainbow's dir
        outputName: 'iconCatalog.html',
        fontPath: 'generated/fonts' //(or dest + fonts.dest)
      }
    }
  ```

**data** (object|optional) &mdash; default data-samples for the views, it will be merged with `locals.data` if present.

**skip** (array|optional) &mdash; list of tasks to skip regardless of their directories exists or not.

**base** (boolean|optional) &mdash; if `false` will disable the `base` feature

> You can use `--no-base` on the CLI for achieving the same

**cwd** (string|optional) &mdash; current working directory

```js
// any sub-directory within `src/`
cwd: 'web/bases'
```

## Tasks

Available tasks: `clean`,  `install`,  `vendor`, `fonts`, `images`, `icons`, `sprites`, `styles`, `scripts`, `views` and `server`

Some tasks are automatically setup if their `src` directory exists, i.e. `scripts` task will be registered only if the `src/default/scripts` directory is present.

> All tasks are prefixed by default, i.e. `gulp rainbow:clean`

Type `gulp rainbow` to execute all the predefined tasks in sequence.

## Folder structure

Rainbow requires a pre-defined directory structure to work, i.e:

```bash
$ tree src
# src/
#  default/         <- required for custom bases
#   ├── env.yml
#   ├── fonts
#   ├── icons
#   ├── images
#   ├── scripts
#   ├── sprites
#   ├── styles
#   └── views
```

> Note that entry point will be always `src/` but you can use the `cwd` option the point out another sub-directory within

Additionally you can use the `--base` option to setup another sub-directory, i.e:

```bash
$ gulp rainbow --base custom
# will use the sub-directory `src/custom` instead
# if you set the `cwd` as `foo/bar` it will use `src/foo/bar/custom`
```

This means you can work on several projects using the same installation.

## File sources

**env.yml** &mdash; settings used to configure our `semantic-ui` dependencies among other things (see the integrations below)

**sprites/** &mdash; all `**/*.png` files will be copied to the `generated/img/` directory

**icons/** &mdash; all `**/*.svg` files icons will be converted to a single font, available as `icon.{svg,ttf,woff}` in the fonts output directory, along with a handy `iconCatalog.html`.  Also, a LESS stylesheet will be created in `styles/_generated/icons.less`.

**images/** &mdash; all `**/*.{jpg,jpeg,png,svg}` files will be copied to the `generated/img/` directory

**scripts/** &mdash; any `**/index.{coffee,litcoffee}` file will be bundled with `webpack` to the `generated/js/` directory using its dirname for the bundle name, i.e. `foo/index.coffee` will be `generated/js/foo.js`.

**styles/** &mdash; all `**/*.less` files will be compiled to the `generated/css/` directory

**views/** &mdash; all `**/*.jade` files will be compiled to the `generated/` directory

**fonts/** &mdash; all `**/*.{ttf,otf,eot,woff,woff2,svg}` files will be compiled to the `generated/fonts/` directory


> Any file or directory starting with an underscore will be skipped, i.e. `_mixins.jade`, `styles/_mixins/hidden.less`, etc.

## Integrations

**Bower**

You can use any dependency from bower directly in your sources.

For `*.less` files we've made the `bower_components/` directory available for `@import`, i.e:

```less
@import './semantic-ui/src/semantic.less';
```

In your `*.jade` files you can inline any dependency using `<link>` or `<script>` tags respectively.

```jade
link(rel='stylesheet', href='vendor/semantic-ui/dist/semantic.css')
script(src='vendor/jquery/dist/jquery.min.js')
```

> All bower dependencies are available under the `vendor/` after you ran the `vendor` task
>
> If you're using sub-directories please consider using a `<base>` tag for avoiding `../` paths

**Semantic-UI**

We haven't found yet a reliable solution for crafting our custom themes, elements and such without cloning the entire repository.

Also we wanted to use only the elements that are really needed, nothing else.

For solving this issues we hack the `semantic-ui` sources on every `gulp` session just overriding the `semantic.less` and `theme.config` files using the following settings:

[bin/stub/src/default/env.yml](https://github.com/gextech/gulp-rainbow/blob/master/bin/stub/src/default/env.yml)

Just comment out the elements or sections you really need include.

Further customizations can be achieved by using `*.{variables,overrides}` files inside a directory called `_site` within your current working directory:

```less
# src/base/_site/collections/menu.variables
@secondaryMargin: 0;
```

All of these [definitions](https://github.com/gextech/Semantic-UI/tree/master/src/definitions) are extracted from [themes](https://github.com/gextech/Semantic-UI/tree/master/src/themes/default), `_site` is a theme.

Using this approach you can redefine almost everything found in semantic-ui.

**Add-ons for Semantic-UI**

In order to reuse custom components we've defined a simple convention for that:

Each module within `bower_components/` directory prefixed as `rainbow-ui-` will be merged with the `semantic-ui` sources.

These modules must have the following directory structure:

```bash
$ tree src
# src/
#   ├── _site
#   ├── definitions
#   ├── themes
```

Of course it must have a `bower.json` manifest, which should expose their sources in the `main` property:

```json
{
  "name": "rainbow-ui-osom_component",
  "version": "1.0.0",
  "main": [
    "src/**/*.*"
  ]
}
```

> This structure is the same as `semantic-ui` source, so you can override almost everything inside

The last thing is doing `bower install rainbow-ui-osom_component --save` and that's it.

Restart your gulp (rainbow) tasks and enjoy!

## CLI utility

For sake of simplicity you can install rainbow globally:

```bash
$ npm install -g gulp-rainbow
```

Now you can share the same rainbow installation across multiple projects.

Try creating a new empty project for that:

```bash
$ mkdir rainbow-test
$ cd rainbow-test
$ rainbow init
```

If you're using a previous rainbow installation with the CLI please remove the `node_modules` directory before.

> Make sure you're specifying the `--cwd foo/bar` as defined in the `gulpfile.js` (if present)

### package.json

```json
"optionalDependencies": {
   "gulp": "^3.8.11",
   "gulp-rainbow": "^0.0.*"
 }
```

Now type `npm install --no-optional` to get only your dependencies.

On CI environments you must use `npm install` as usual.

## Issues?

We're working on `gulp-rainbow` almost every day.

Please send an issue or feel free to PR.
