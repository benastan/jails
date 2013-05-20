var HTTP = Jails.HTTP || function() {
  $.ajax.apply($, arguments);
};
var Query = function(model, dataset) {
      var _this = this;
      this.model = model;
      this.queryParams = {};
      this.fetchAll = false;
      this.queue = new Queue(function(cb) { cb.apply(_this); });
      if (! dataset instanceof Dataset) {
        dataset = new Dataset(model, query);
      }
    },
    aliasQueryMethods = 'limit page'.split(' ');
Query.prototype.url = function() {
  var model = this.model;
  return (typeof model.url == 'function') ? model.url() : model.url;
};
Query.prototype.all = wrap(function() {
  this.fetchAll = true;
  this.queryParams = {};
});
Query.prototype.where = wrap(function(arg, val) {
  var where = this.queryParams.where || {};
  if (typeof arg === 'string') {
    where[arg] = val;
  } else {
    $.extend(where, arg);
  }
  this.queryParams.where = where;
});
Query.prototype.query = wrap(function(cb) {
  var model = this.model,
      dataset = this.dataset,
      query = this;
  Jails.HTTP({
    type: 'GET',
    url: this.url(),
    data: this.queryParams,
    success: function(res) {
      var currentAttributes;
      for (var i in res) {
        currentAttributes = res[i];
        dataset.add(model(currentAttributes));
      }
      query.queue.flush();
    }
  });
});
Query.prototype.synced = wrap(function(cb) { this.queue.push(cb); });
for (var i = 0, ii = aliasQueryMethods.length; i < ii; i++) {
  (function() {
    var key = aliasQueryMethods[i];
    Query.prototype[key] = wrap(function(value) {
      this.fetchAll = false;
      this.queryParams[key] = value;
    });
  }());
}
