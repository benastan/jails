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
