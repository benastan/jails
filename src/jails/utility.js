var oldJails = this.Jails;
var root = typeof window === 'undefined' ? module.exports : window.Jails = {};
var wrap = function(fn) {
      return function() {
        fn.apply(this, arguments);
        return this;
      };
    },
    defined = function(anything) {
      return typeof anything !== 'undefined';
    };


if (typeof jQuery === 'undefined' && typeof Zepto === 'undefined') {
  $ = require('jquery').create();
} else {
  $ = jQuery || Zepto;
}
var Jails = root;
if (typeof oldJails === 'object') {
  for (var i in oldJails) {
    if (oldJails.hasOwnProperty(i)) {
      Jails[i] = oldJails[i];
    }
  }
}
