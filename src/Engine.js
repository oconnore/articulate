var Promise = require('es6-promise');
var Map = require('harmony-enumerables').Map;
var Set = require('harmony-enumerables').Set;
var Deque = require('double-ended-queue');

var Grammar = require('./src/grammar');

function Engine(opts) {
  this.commands = new Map();
  this.macros = new Map();
  this.parser = new Grammar();
}

Engine.prototype.register = function(node) {
  if (node instanceof MacroProc) {
    this.macros.set(node.name, node);
  } else if (node instanceof CommandProc) {
    this.commands.set(node.name, node);
  } else {
    throw new Error('Cannot register node type '+node.toString());
  }
};

Engine.prototype.getAST = function(source) {
  if (typeof source.read === 'function') {
    var engine = this;
    return new Promise(function(res, rej) {
      var col = [];
      source.on('readable', function() {
        col.push(source.read());
      });
      source.on('error', function(err) {
        rej(err);
      });
      source.on('end', function() {
        res(engine.parser.parse(col.join('')));
      });
    });
  } else if (typeof source !== 'string') {
    source = source.toString();
  }
  return Promise.resolve(this.parser.parse(source));
};

Engine.prototype.traverse = function(ast) {
  var eng = this;
  if (typeof ast.then === 'function') {
    return ast.then(function(tree) {
      return eng.traverse(tree);
    });
  } else {
    var stack = new Deque([ast]);
    while (!stack.isEmpty()) {
      var head = stack.pop();
      new Promise(function(res, rej) {
        if (typeof head.pre === 'function') {
          res(head.pre());
        } else {
          res();
        }
      });
    }
  }
};

module.exports = Engine;
