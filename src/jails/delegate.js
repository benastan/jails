var Delegate = function(target) {
      var delegate = this;
      target.delegate = function(method, options) {
        delegate.register(method, options);
      };
      this.target = target;
    };
Delegate.prototype.register = function(methods, options) {
  var target = this.target;
  if (typeof methods === 'string') {
    methods = [methods];
  }
  methods.forEach(function(method) {
    target[method] = function() {
      var delegate = options.to.apply(this);
      return delegate[method].apply(delegate, arguments);
    };
  });
};
