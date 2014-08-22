var parser = require('../src/Grammar.js').parser;
var Lexer = require('../src/Lexer').Lexer;
var Article = require('../src/Article');

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;

suite('Parser tests', function() {
  
  var files = [];
  var fixtures = _.compact(fs.readdirSync('./test/fixtures').map(function(x) {
    if (/.\.art$/.exec(x)) {
      files.push(x);
      return fs.readFileSync(path.join('test/fixtures', x),
        {encoding: 'utf8'});
    } else {
      return null;
    }
  }));

  function fileFixture(name) {
    return fixtures[_.indexOf(files, name)];
  }

  before(function() {
    parser.yy = Article;
    parser.lexer = new Lexer();
  });

  suite('Error quick check', function() {
    for (var i = 0; i < fixtures.length; i++) {
      (function(j) {
        test('Parse completes for '+files[j], function() {
          parser.parse(fixtures[j]);
        });
      })(i);
    }
  });

  suite('Semantics', function() {
    test('Macro parse', function() {
      var p = parser.parse(fileFixture('macro-pipes.art'));
      assert.ok(p[0] instanceof Article.Macro);
      assert.equal(p[0].name, 'macro');
      assert.equal(p[0].pipes.length, 2);
      assert.deepEqual(p[0].args, ['a', 'b']);
      var p1 = p[0].pipes[0];
      var p2 = p[0].pipes[1];
      assert.equal(p1.name, 'pipe1');
      assert.deepEqual(p1.args, ['quote']);
      assert.equal(p2.name, 'pipe2');
      assert.deepEqual(p2.args, []);
    });
    test('Quick macro parse', function() {
      var p = parser.parse(fileFixture('macro-quick.art'));
      assert.ok(p[0] instanceof Article.Macro);
      assert.equal(p[0].name, 'qmacro');
      assert.equal(p[0].pipes.length, 1);
      assert.deepEqual(p[0].args, ['p']);
      var p1 = p[0].pipes[0];
      assert.equal(p1.name, 'pipe');
      assert.deepEqual(p1.args, ['q']);
      assert.equal(p[0].body, 'test macro %%%{}()\\|');
      assert.ok(p[2] instanceof Article.Macro);
      assert.equal(p[2].name, 'qmacro');
      assert.equal(p[2].body, '\n');
    });
  });

});

