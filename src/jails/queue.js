var Queue = function(wrapper) {
      this.wrapper = wrapper;
      this.queue = [];
    };
Queue.prototype.flush = function() {
  var cb;
  while (defined(cb = this.queue.shift())) {
    this.wrapper(cb);
  }
};
Queue.prototype.push = function(cb) {
  if (typeof cb === 'function') {
    this.queue.push(cb);
  }
};
