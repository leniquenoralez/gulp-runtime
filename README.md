

## gulp-runtime [<img alt="Gitter" align="right" src="https://badges.gitter.im/Join Chat.svg"/>](https://gitter.im/stringparser/gulp-runtime?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)

[<img alt="build" src="http://img.shields.io/travis/stringparser/gulp-runtime/master.svg?style=flat-square" align="left"/>](https://travis-ci.org/stringparser/gulp-runtime/builds)

[<img alt="NPM version" src="http://img.shields.io/npm/v/gulp-runtime.svg?style=flat-square" align="right"/>](http://www.npmjs.org/package/gulp-runtime)

<p align="center">
  use
  <a href="https://github.com/gulpjs/gulp">
    <b style="color:#D32929;">gulp</b>
  </a>
  whilst is running
</p>
<p align="center">
  <img height=350 src="./docs/gulp-runtime.png"/>
</p>
<h3 align="center" style="border-bottom:0; font-weight:normal;">
  <a href="./docs"><b>documentation</b></a>
</h3>

## usage

Require the module to have a REPL

```js
 var runtime = require('gulp-runtime');
```
When you want to see the prompt, press enter

```sh
[13:07:50] Starting 'default'...
[13:07:50] Finished 'default' after 800 μs
 >
```
run tasks

```sh
> (press tab)
--silent        --tasks         -T              --tasks-simple  -v              --version       --require
--gulpfile      lint            jade            stylus          js
jsx             browserify      default
 > browserify
[14:28:53] Starting 'js', 'jsx', 'browserify' ...
[14:28:53] Finished 'js' after 17 μs, 'jsx' after 21 μs, 'browserify' after 27 μs
```

use the [gulp cli][x-gulp-cli] without exiting the process

````sh
 > --tasks
[14:25:14] Tasks for ~/code/gulp-runtime/gulpfile.js
[14:25:14] ├── lint
[14:25:14] ├── jade
[14:25:14] ├── stylus
[14:25:14] ├── js
[14:25:14] ├── jsx
[14:25:14] ├─┬ browserify
[14:25:14] │ ├── js
[14:25:14] │ └── jsx
[14:25:14] └─┬ default
[14:25:14]   ├── lint
[14:25:14]   ├── jade
[14:25:14]   ├── stylus
[14:25:14]   └── browserify
````

run gulpfiles directly

````sh
$ node project/gulpfile.js browserify
[14:28:53] Starting 'js', 'jsx', 'browserify' ...
[14:28:53] Finished 'js' after 17 μs, 'jsx' after 21 μs, 'browserify' after 27 μs  
 >
````

### whats in
- A REPL with standard shell behavior (Ctrl+L, Ctrl+C, history, command and path completion).
- Custom commands definition and flow control.
- Run gulp directly from a `gulpfile`.
- Log task code directly on the terminal using `--log` (yep, I'm  that lazy).

### install

With [npm](https://www.npmjs.org)

    mpm install --save-dev gulp-runtime
### pending

 - [ ] Unicorn approval.

### stats

[<img src="https://nodei.co/npm/gulp-runtime.png?downloads=true&downloadRank=true&stars=true" alt="NPM" align="center"/>](https://nodei.co/npm/gulp-runtime)

[<img src="https://nodei.co/npm-dl/gulp-runtime.png" alt="NPM" align="center"/>](https://nodei.co/npm/gulp-runtime/)

## license

[<img alt="LICENSE" src="http://img.shields.io/npm/l/gulp-runtime.svg?style=flat-square"/>](http://opensource.org/licenses/MIT)



[x-gulp-cli]: https://github.com/gulpjs/gulp/blob/master/docs/CLI.md
