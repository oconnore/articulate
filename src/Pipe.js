var AstNode = require('./AstNode');

function Pipe(name, args) {
  this.name = name;
  this.args = args;
}
Pipe.prototype = Object.create(AstNode.prototype);
Pipe.prototype.constructor = Pipe;
Pipe.prototype._toStringPartial = function() {
  return [
    this.name, '(', this.args && this.args.join(', '), ')'
  ].join('');
};

module.exports = Pipe;
