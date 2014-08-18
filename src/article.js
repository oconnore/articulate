var _ = require('lodash');
var WeakMap = require('enumerable-collections').WeakMap;

var priv = new WeakMap();

function AstPrivate() {
  this.children = [];
}

function AstNode(o) {
  if (this.__proto__ === AstNode.prototype) {
    throw new Error('abstract class');
  }
  var defpriv = new AstPrivate();
  if (o && (o instanceof AstNode)) {
    defpriv.children = o.children;
  }
  priv.set(this, defpriv);
}
AstNode.prototype.constructor = AstNode;
Object.defineProperty(AstNode.prototype, 'children' {
  get: function(){
    return priv.get(this).children;
  },
  set: function(val) {
    if (!Object.isFrozen(this)) {
      priv.get(this).children = val;
    }
  }
});

AstNode.prototype.lock = function() {
  Object.freeze(this);
};

AstNode.prototype.clone = function() {
  return new (this.__proto__.constructor)(this);
};

function Command(name, args, body) {
  this.name = name;
  this.args = args;
  this.body = body;
  AstNode.call(this);
}
Command.prototype = Object.create(AstNode.prototype);
Command.prototype

function Macro(name, params, pipes, env) {
  this.name = name;
  this.params = params;
  this.pipes = pipes;
  this.body = [];
  this.init(env);
  AstNode.call(this);
}
Macro.prototype = Object.create(AstNode.prototype);
Macro.prototype.init = function(env) {
  var lex = env.lexer;
  var startLine = lex.yylineno;
  var ch = null;
  var original, heredoc = [];

  while (ch !== '\n') {
    if (ch !== '<' && ch !== null) {
      heredoc.push(ch);
    }
    ch = lex.input.read(1);
  }
  lex.yylineno++;
  heredoc = '\n' + heredoc.join('').trim();
  var slice = '', pos;
  while (true) {
    var read = lex.input.read(128);
    if (read === null) {
      throw new Error('Expected "'+heredoc.trim()+'" before EOF, search started: '+
        [startLine, 0].toString());
    }
    slice = slice + read;
    pos = slice.indexOf(heredoc);
    if (pos !== -1) {
      this.body.push(slice.substr(0, pos));
      lex.input.unshift('<' + slice.substr(pos + heredoc.length));
      break;
    } else {
      var offset = Math.max(slice.length - heredoc.length, 0);
      this.body.push(slice.substr(0, offset));
      slice = slice.substr(offset);
    }
  }
  lex.yylineno++;
  var c = 0;
  for (var i = 0; i < this.body.length; i++) {
    if (this.body[i] === '\n') {
      lex.yylineno++;
      c++;
    }
  }
  console.log('body', this.body, 'has', c, 'newlines');
  this.body = this.body.join('');
};

function Pipe(name, args) {
  this.name = name;
  this.args = args;
}

function unify(arr) {
  var col = [], strl = [];
  var str = false;
  for (var i = 0; i < arr.length; i++) {
    if (str) {
      if (typeof arr[i] === 'string') {
        strl.push(arr[i]);
      } else {
        str = false;
        col.push(strl.join(''));
        col.push(arr[i]);
      }
    } else {
      if (typeof arr[i] === 'string') {
        strl = [arr[i]];
        str = true;
      } else {
        col.push(arr[i]);
      }
    }
  }
  if (str && strl.length > 0) {
    col.push(strl.join(''));
  }
  return col;
}

module.exports = _.reduce([
  Command, Macro, unify
], function(col, ctor) {
  col[ctor.name] = ctor;
  return col;
}, {});
  
