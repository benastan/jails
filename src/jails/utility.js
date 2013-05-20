var wrap = function(fn) {
      return function() {
        fn.apply(this, arguments);
        return this;
      };
    },
    defined = function(anything) {
      return typeof anything !== 'undefined';
    };

