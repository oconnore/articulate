var WeakMap = require('harmony-enumerables').WeakMap;

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

Object.defineProperty(AstNode.prototype, 'children', {
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
  throw new Error('clone method not implemented for '+this.toString());
};

AstNode.prototype.toString = function() {
  return [
    '<#', this.__proto__.constructor.name, ':',
    this._toStringPartial(),
    '#>'
  ].join('');
};

module.exports = AstNode;
