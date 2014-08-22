var stream = require('readable-stream');
var through = require('through2');

/* ==============================================================
  String Stream
============================================================== */

function StringStream(input, opts) {
  stream.Readable.call(this, opts);
  this.input = input;
  this.pos = 0;
}
module.exports.StringStream = StringStream;
StringStream.prototype = Object.create(stream.Readable.prototype);
StringStream.prototype._read = function(n) {
  if (typeof n !== 'number' || n <= 0) {
    n = Number.MAX_VALUE;
  }
  if (this.pos < this.input.length) {
    var slice = this.input.substr(
      this.pos, Math.min(this.input.length, this.pos + n));
    this.pos += slice.length;
    this.push(slice);
  } else {
    this.push(null);
  }
};

/* ==============================================================
  Lexer
============================================================== */

function Location(sl, sc, el, ec) {
  this.first_line = sl;
  this.first_column = sc;
  this.last_line = el;
  this.last_column = ec;
}

function Lexer() {
  this.colno = 0;
  this.yylloc = this.yyloc = new Location(1,0,1,0);
  this.yylineno = 0;
  this.yytext = '';
  this.yylloc = null;
}
module.exports.Lexer = Lexer;

function streamPipe(chunk, enc, cb) {
  if (enc !== 'utf8') {
    this.push(chunk.toString('utf8'));
    cb();
  } else {
    this.push(chunk);
    cb();
  }
}

Lexer.prototype.setInput = function(input) {
  if (input) {
    if (typeof input === 'string' || input instanceof Buffer) {
      this.input = new StringStream(input.toString(), {
        encoding: 'utf8'
      });
    } else if (typeof input.pipe === 'function') {
      this.input = input.pipe(through(streamPipe));
    } else {
      throw new Error('invalid input type ' + typeof input);
    }
  } else {
    throw new Error('no input');
  }
};


Lexer.prototype.lex = function() {
  this.yylloc = this.yyloc;
  var ret;
  var text = [];
  var type = null;
  var col = this.colno;
  var line = this.yylineno;
  var cur = null;
  function typeOrNull(nt) {
    return type === null || nt === type;
  }
  while (true) {
    cur = this.input.read(1);
    if (cur === null) {
      if (type !== null) {
        this.yytext = text.join('');
        this.yyloc = new Location(line, col, line, col + text.length);
      } else {
        type = 'EOF';
        this.yytext = null;
        this.yyloc = new Location(line, col, line, col + 1);
      }
      break;
    } else if (typeOrNull('WS') && /\s+/.exec(cur)) {
      if (cur === '\n') {
        this.yylineno++;
        this.colno = 0;
      } else {
        this.colno++;
      }
      type = 'WS';
      text.push(cur);
    } else if (typeOrNull('WORD') && /[^\s\\{}()<|%,"]/.exec(cur)) {
      type = 'WORD';
      text.push(cur);
      this.colno++;
    } else if (type === null) {
      if (cur === '\\') {
        type = 'ESC';
      } else {
        type = cur;
      }
      this.colno++;
      this.yyloc = new Location(line, col, line, col + 1);
      this.yytext = cur;
      break;
    } else {
      this.yytext = text.join('');
      this.yyloc = new Location(line, col, this.yylineno, this.colno);
      this.input.unshift(cur);
      break;
    }
  }
  return type;
};

