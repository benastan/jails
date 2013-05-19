(function(Jails) {
  var wrap = function(fn) {
        return function() {
          fn.apply(this, arguments);
          return this;
        };
      },
      defined = function(anything) {
        return typeof anything !== 'undefined';
      };

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
  var HTTP = Jails.HTTP || function() {
    $.ajax.apply($, arguments);
  };

  var Model = function(id_or_attributes, attributes) {
        var model,
            klass = arguments.callee;
        if (this instanceof Model) {
          if (typeof attributes == 'undefined') {
            if (typeof id_or_attributes === 'number') {
              this.id = id_or_attributes;
              this.attributes = {};
            } else {
              this.attributes = id_or_attributes;
            }
          } else {
            this.id = id_or_attributes;
            this.attributes = attributes;
          }
          if ('id' in this.attributes) {
            if (typeof this.id === 'undefined') {
              this.id = this.attributes.id;
            }
            delete this.attributes.id;
          }
          if (typeof this.id !== 'undefined') {
            if (typeof klass.models[this.id] !== 'undefined') {
              throw Error('Jailed in! Do not use `new Model()` to instantiate with id. Use `Model(id, attributes)`');
            } else {
              klass.models[this.id] = this;
            }
          }
          this.setup();
        } else {
          if (typeof id_or_attributes === 'number') {
            if (attributes instanceof klass) {
              model = klass.models[id_or_attributes] = attributes;
            } else if (attributes === null) {
              delete klass.models[id_or_attributes];
            } else if (typeof (model = klass.models[id_or_attributes]) === 'undefined') {
              model = new klass(id_or_attributes, attributes);
              model.set(attributes);
            }
          } else {
            if (typeof (attributes = id_or_attributes || attributes) !== 'undefined') {
              if ('id' in attributes) {
                id_or_attributes = attributes.id;
                delete attributes.id;
                model = klass(id_or_attributes, attributes);
              } else {
                model = new klass(attributes);
              }
            } else {
              model = new klass();
            }
          }
        }
        return model;
      };
  Model.prototype.set = function(key, val) {
    if (typeof key === 'string' || typeof key === 'number') {
      this.attributes[key] = val;
    } else {
      for (var i in key) this.set(i, key[i]);
    }
  };
  Model.prototype.setup = function() {
    var _this = this;
    this.queue = new Queue(function(cb) {
      cb.apply(_this);
    });
  };
  Model.prototype.synced = function(cb) {
    this.queue.push(cb);
  };
  Model.extend = function(proto) {
    var _super = this, klass;
    klass = function() { _super.call(this, arguments); };
    klass.prototype = _super.prototype;
    for (var i in this) {
      if (this.hasOwnProperty(i)) {
        klass[i] = this[i];
      }
    }
    for (i in proto) {
      var method = proto[i],
          __super = _super.prototype[i];
      if (typeof method === 'function' && typeof __super === 'function') {
        method._super = __super;
      }
      klass.prototype[i] = method;
    }
    // Add dataset methods.
    for (i in this.DatasetMethods) {
      klass[i] = this.DatasetMethods[i];
    }
    klass.extend = this.extend;
    return klass;
  };
  Model.models = {};

  var Dataset = function(model) {
        var _this = this;
        this.model = model;
        this.queryParams = {};
        this.fetchAll = false;
        this.queue = new Queue(function(cb) { cb.apply(_this); });
      },
      aliasDatasetMethods = 'limit page'.split(' ');
  Dataset.prototype.query = wrap(function(cb) {
    var model = this.model,
        dataset = this;
    Jails.HTTP({
      type: 'GET',
      url: this.url(),
      data: this.queryParams,
      success: function(res) {
        dataset.models = res.reduce(function(data, attrs) {
          data.push(dataset.model(attrs));
          return data;
        }, []);
        dataset.queue.flush();
      }
    });
  });
  Dataset.prototype.synced = wrap(function(cb) { this.queue.push(cb); });
  Dataset.prototype.url = function() {
    var model = this.model;
    return (typeof model.url == 'function') ? model.url() : model.url;
  };
  Dataset.prototype.all = wrap(function() {
    this.fetchAll = true;
    this.queryParams = {};
  });
  Dataset.prototype.where = wrap(function(arg, val) {
    var where = this.queryParams.where || {};
    if (typeof arg === 'string') {
      where[arg] = val;
    } else {
      $.extend(where, arg);
    }
    this.queryParams.where = where;
  });
  for (var i = 0, ii = aliasDatasetMethods.length; i < ii; i++) {
    (function() {
      var key = aliasDatasetMethods[i];
      Dataset.prototype[key] = wrap(function(value) {
        this.fetchAll = false;
        this.queryParams[key] = value;
      });
    }());
  }
  Model.DatasetMethods = 'all limit page where'.split(' ').reduce(function(memo, methodName) {
    memo[methodName] = function() {
      var dataset = new Dataset(this);
      return dataset[methodName].apply(dataset, arguments);
    };
    return memo;
  }, {});
  Model.fetch = function() {
    return this.all().query();
  };
  Model.count = function() {
    var count = 0;
    this.forEach(function(model, i) {
      count ++;
    });
    return count;
  };
  Model.forEach = function(iterator) {
    var objects = this.models;
    for (var i in objects) {
      if (objects.hasOwnProperty(i)) {
        iterator.apply(this, [objects[i], i]);
      }
    }
  };
  Model.empty = function() {
    this.forEach(function(model, i) {
      delete this.models[i];
    });
  };

  window.Queue = Jails.Queue = Queue;
  window.Dataset = Jails.Dataset = Dataset;
  window.Model = Jails.Model = Model;
  window.Jails = Jails;
})({});
