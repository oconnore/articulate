var _ = require('lodash');

var AstNode = require('./AstNode');

var Command = require('./Command');
var Macro = require('./Macro');
var Pipe = require('./Pipe');

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
  Command, Macro, unify, Pipe
], function(col, ctor) {
  col[ctor.name] = ctor;
  return col;
}, {});
  
