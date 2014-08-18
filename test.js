var util = require('util');
var fs = require('fs');
var parser = require('./grammar.js').parser;
var Lexer = require('./src/lexer').Lexer;


parser.yy = require('./src/article');
parser.lexer = new Lexer();
var data = fs.readFileSync('test.artc', {encoding: 'utf8'});
console.log(JSON.stringify(parser.parse(data)));

/*
var lex = new Lexer()
lex.setInput(data);
var tok = lex.lex();
while(tok !== 'EOF') {
  console.log('Token:', tok);
  tok = lex.lex();
}
*/

