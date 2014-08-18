var fs = require('fs');
var gulp = require('gulp');
var jison = require('jison');

gulp.task('jison', function() {
  var bnf = fs.readFileSync('./src/grammar.jison', 'utf8');
  var parser = new jison.Parser(bnf);
  fs.writeFileSync('./src/grammar.js', parser.generate(), 'utf8');
});

gulp.task('default', ['jison'], function() {
});

