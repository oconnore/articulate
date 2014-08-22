var AstNode = require('./AstNode');

function Command(name, args, body) {
  this.name = name;
  this.args = args;
  this.body = body;
  AstNode.call(this);
}
Command.prototype = Object.create(AstNode.prototype);
Command.prototype.constructor = Command;
Command.prototype._toStringPartial = function() {
  return [
    this.name, '(', this.args.join(', '), '){',
    this.body, '}'].join('');
};

module.exports = Command;
