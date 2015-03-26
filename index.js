'use strict';

var path = require('path');
var util = require('./lib/util');
var runtime = require('runtime');

/*
 ¿Do we have gulp installed?
*/

try { require('gulp'); }
catch(err){
  throw new util.PluginError({
    plugin: 'gulp-runtime',
    message: 'gulp is not installed locally.'+
     'Try:\n    `npm install gulp`'
  });
}

/*
 Give a task method that behaves like gulp does
*/

runtime.Runtime.prototype.task = function(name, dep, handle){
  if(typeof name !== 'string'){
    throw new util.PluginError({
      plugin: 'gulp-runtime',
      message: 'task(name, handle). Tasks require a string `name`'
    });
  } else if(arguments.length < 2){
    throw new util.PluginError({
      plugin: 'gulp-runtime',
      message: 'task(name, [deps, handle]).' +
      'Tasks need at least one more argument\n'+
      ' - handle: function for the task\n'+
      ' - deps: array of task dependencies to run before this one'+
      '\n'
    });
  }

  require('gulp').task(name, dep, handle);
  
  var depType = util.type(dep);
  var handleType = util.type(handle);

  handle = handleType.function || depType.function
   || function(next){ next(); };

  if(!depType.array || !dep.length){
    return this.set(name, handle);
  } else if(!handle.name && !handle.displayName){
    handle.displayName = name;
  }

  this.set(name, {
    dep: dep,
    handle: this.stack(dep.join(' '), handle, {wait: true})
  });
};

/*
 For errors anywhere in the stack
*/

runtime.Stack.prototype.onHandleError = function(error, next){
  if(this.errorFound){ throw this.errorFound; }

  util.log(util.color.yellow('gulp-runtime')+':',
    'error coming from', '\'' + util.color.cyan(next.match) + '\''
  );

  if(error.plugin){
    process.stdout.write('from plugin', error.plugin);
  }

  this.errorFound = error;

  if(!this.repl){ throw error; }
  util.log(error.stack);
  next();
};

/*
 For not found tasks
*/

runtime.Stack.prototype.onHandleNotFound = function(next){
  var path = next.match || next.path;
  var message = 'no task found for `'+path+'`.\n'+
    'Set one with `task(' +
    (path ? '\'' + path + '\', ' : path) + '[Function])`';

  if(!this.repl){ throw new Error(message); }
  this.repl.input.write('Warning: '+message+'\n');
  this.repl.prompt();
};


/*
 Make a logger that looks like gulp's
*/

runtime.Stack.prototype.onHandle = function(next){
  var len = this.argv.length > 1;
  var path = next.match || next.path;
  var host = this.host ? this.host.path : '';
  var mode = this.wait ? 'series' : 'parallel';
  var time, status = next.time ? 'Finished' : 'Wait for';

  if(!this.time && host){
    util.log('Started',
      '\'' + util.color.cyan(this.path) + '\'',
      'from ' + util.color.green(host), 'in',
      util.color.bold(mode)
    );
  } else {
    time = next.time
      ? util.prettyTime(process.hrtime(next.time))
      : '';

    util.log((len ? '- ' : '') + status,
      '\'' + util.color.cyan(path) + '\'' +
      (time ? ' in ' + util.color.magenta(time) : '')
    );
  }

  if(!this.time){ this.time = process.hrtime(); }
  if(!next.time){ next.time = process.hrtime(); }

  var self = this;
  while(len && self && !self.queue){
    time = util.prettyTime(process.hrtime(self.time));
    util.log(
      'Finished', '\'' + util.color.cyan(self.path) + '\'',
      (host ? 'from '+ util.color.green(host) + ' ' : '') +
      'in ' +  util.color.magenta(time)
    );

    self = self.host;
  }

  if(this.repl && !this.queue){
    this.repl.prompt();
  }
};

/*
 Lets do the gulp CLI
*/

var app = runtime.create();

/*
 -v or --version
 */
app.set(':version(-v|--version)', function(next){
  if(!app.get().GULP_ENV){ util.lazy(null, app); }

  var chalk = util.color;
  var semver = util.semver;
  var env = app.get().GULP_ENV;
  var localPackage = env.localPackage;
  var globalPackage = env.globalPackage;

  if( env.globalPackage.version === void 0 ){
    util.log('Working locally with gulp@' + localPackage.version );
  } else if(semver.gt(globalPackage.version, localPackage.version)){
    util.log(chalk.red('Warning: gulp version mismatch:'));
    util.log(chalk.red('Global gulp is', globalPackage.version));
    util.log(chalk.red('Local gulp is', localPackage.version));
  } else {
    util.log('CLI version', globalPackage.version);
    util.log('Local version', localPackage.version);
  }

  next();
  if(this.repl && !this.queue){
    this.repl.prompt();
  }
});

/*
 --tasks, -T or --tasks-simple
 */
app.set(':tasks(--tasks|-T|--tasks-simple)', function (next){
  if(!app.get().GULP_ENV){ util.lazy(null, app); }
  if(!util.logTasks){ util.lazy('tasks-flags'); }

  var gulp = require('gulp');
  var flag = next.params.tasks;
  var env = app.get().GULP_ENV;

  if(flag.tasksSimple){
    util.logTasksSimple(env, gulp);
  } else {
    util.logTasks(env, gulp);
  }

  next();
  if(this.repl && !this.queue){
    this.repl.prompt();
  }
});

/*
 --silent
 */
app.set('--silent', function(next){
  var silent = app.get().silent;

  if(silent){
    util.log('logging enabled');
  }

  if(process.argv.indexOf('--tasks-simple') > 0){
    silent = true;
  } else {
    silent = false;
  }

  next();
  app.set({silent: silent});
  if(this.repl && !this.queue){
    this.repl.prompt();
  }
});

/*
 --require, --gulpfile is the same but changing the cwd
 */
app.set('(--require|--gulpfile) :filename', function (next){
  if(!util.tildify){ util.lazy('require-flags'); }

  var cwd = process.cwd();
  var filename = next.params.filename;
  filename = path.resolve(cwd, filename);
  var cached = Boolean(require.cache[filename]);
  var isGulpfile = /--gulpfile/.test(this.queue);

  util.log(util.color.yellow('gulp-runtime'));
  if(cached){ delete require.cache[filename]; }

  try {
    require(filename);
  } catch(err){
    var message = 'Could not find ' +
      (isGulpfile ? 'gulpfile' : 'module') +
      util.tildify(filename);

    if(this.repl){ console.log(message); } else {
      throw new util.PluginError({
        plugin: util.color.yellow('gulp-runtime'),
        message: message
      });
    }
  }

  util.log(
    (cached ? util.color.cyan('Reloaded') : 'Loaded'),
    util.color.magenta(util.tildify(filename))
  );

  if(!isGulpfile){ next(); }
  if(this.repl && !this.queue){
    this.repl.prompt();
  }

  process.cwd(path.dirname(filename));
  util.log('Working directory changed to',
    util.color.magenta(util.tildify(process.cwd()))
  );

  process.nextTick(function(){
    var gulp = require('gulp');
    Object.keys(gulp.tasks).forEach(function(task){
      app.task(task, task.dep, task.fn);
    });
    next();
  });
});

exports = module.exports = app;
