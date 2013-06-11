var oldJails = this.Jails,
    root = typeof window === 'undefined' ? module.exports : window.Jails = {},
    wrap = function(fn) {
      return function() {
        fn.apply(this, arguments);
        return this;
      };
    },
    defined = function(anything) {
      return typeof anything !== 'undefined';
    };
if (typeof $ === 'undefined' && typeof Zepto === 'undefined' && typeof require === 'undefined') {
  throw new Error("Jailed in! One of jQuery or Zepto is a dependency.");
} else {
  $ = require('jquery').create();
}
var Jails = root;
if (typeof oldJails === 'object') {
  for (var i in oldJails) {
    if (oldJails.hasOwnProperty(i)) {
      Jails[i] = oldJails[i];
    }
  }
}
