var runtime = require('../gulp-runtime');
var gulp = require('gulp');
var gutil = require('gulp-util');
var chalk = gutil.colors;

runtime.set(["--tasks", "-T", "--tasks-simple"], function(argv, args, next){

  if(args.T || args.tasks){

    var env = runtime.config('env');
    var taskTree = require('gulp/lib/taskTree');
    var archy = require('gulp/node_modules/archy');
    var tildify = require('gulp/node_modules/tildify');

    var tree = taskTree(gulp.tasks);
    tree.label = 'Tasks for ' + chalk.magenta(tildify(env.PWD));
    archy(tree)
      .split('\n')
      .forEach(function (v) {
        if (v.trim().length === 0) {
          return;
        }
        gutil.log(v);
      });
  }
  else if(args['tasks-simple']){

    console.log(Object.keys(gulp.tasks)
      .join('\n')
      .trim()
    );
  }

});

/*
 * Add custom tasks
 */

runtime.waiting('startup', function(){

  runtime.completion(function(){

    var tasks = Object.keys(gulp.tasks);

    if(tasks.indexOf('default') !== -1)
        tasks.splice(tasks.indexOf('default'), 1);

    return tasks;
  })

}).handle(function gulpTasks(argv, args, next){

  var tasks = argv;

  if( tasks.indexOf('default') !== -1){
    console.log(
      '[gulp-runtime] '+
      '"'+chalk.cyan('default')+'" task is not avaliable at runtime.'
    );
    tasks.splice(tasks.indexOf('default'), 1);
  }

  tasks = tasks.filter(function(name){
    return gulp.tasks[name];
  });

  if(tasks.length !== 0){

    tasks.push(function(){
      runtime.prompt();
      gulp.doneCallback = undefined;
      console.log(gulp)
    });

    gulp.start.apply(gulp, tasks);
  }

});