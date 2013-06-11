var Queue = function(wrapper) {
      this.wrapper = wrapper;
      this.clear();
    };
Queue.prototype.flush = function() {
  var cb;
  while (defined(cb = this.queue.shift())) {
    this.wrapper(cb);
  }
};
Queue.prototype.trigger = function(args) {
  this.queue.forEach(this.wrapper);
};
Queue.prototype.push = function(cb) {
  if (typeof cb === 'function') {
    this.queue.push(cb);
  }
};
Queue.prototype.clear = function() {
  this.queue = [];
};
