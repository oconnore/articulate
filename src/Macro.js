var AstNode = require('./AstNode');

function Macro(name, args, pipes, env) {
  this.name = name;
  this.args = args;
  this.pipes = pipes;
  this.body = [];
  this.init(env);
  AstNode.call(this);
}
Macro.prototype = Object.create(AstNode.prototype);
Macro.prototype.constructor = Macro;
Macro.prototype._toStringPartial = function() {
  return [
    this.name, '(', this.args.join(', '), ')',
    ' pipes= ', this.pipes.map(function(x) { return x.toString(); }).join(', '),
    '; {', this.body, '}'].join('');
};

Macro.prototype.init = function(env) {
  var lex = env.lexer;
  var startLine = lex.yylineno;
  var ch = null;
  var original, search = '\n', heredoc = [];
  var brackets = 0;
  while (ch !== '\n') {
    if (ch !== '<' && ch !== null) {
      brackets = null
      heredoc.push(ch);
    } else if (typeof brackets === 'number') {
      brackets++;
      if (brackets >= 2) {
        heredoc = ['>>'];
        search = '';
        break;
      }
    }
    ch = lex.input.read(1);
  }
  lex.yylineno++;
  search = search + heredoc.join('').trim();
  var slice = '', pos;
  while (true) {
    var read = lex.input.read(128);
    if (read === null) {
      throw new Error('Expected "'+search.trim()+'" before EOF, search started: '+
        [startLine, 0].toString());
    }
    slice = slice + read;
    pos = slice.indexOf(search);
    if (pos !== -1) {
      this.body.push(slice.substr(0, pos));
      lex.input.unshift(slice.substr(pos + search.length));
      break;
    } else {
      var offset = Math.max(slice.length - search.length, 0);
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
  this.body = this.body.join('');
};

module.exports = Macro;
