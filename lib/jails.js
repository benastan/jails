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

  var Dataset = function(model, query) {
        this.model = model;
        this.models = [];
        if (query instanceof Query) {
          this.query = query;
        }
      };
  Dataset.prototype.add = wrap(function(model) {
    var preExistingModel, mergeModel;
    if (model instanceof this.model) {
      if (typeof model.id !== 'undefined' && (preExistingModel = this.find(model.id)) instanceof this.model) {
        this.remove(preExistingModel);
        model = this.model.mergeModels(preExistingModel, model);
        model.id = model.id;
      }
      this.models.push(model);
    } else if (model instanceof Array) {
      for (var i in model) {
        this.add(model[i]);
      }
    }
  });
  Dataset.prototype.remove = wrap(function(model_or_id) {
    var model, index;
    if (model_or_id instanceof this.model) {
      model = model_or_id;
    } else {
      model = this.find(model_or_id);
    }
    index = this.models.indexOf(model);
    this.models.splice(index, 1);
  });
  Dataset.prototype.empty = wrap(function() {
    delete this.models;
    this.models = [];
  });
  Dataset.prototype.find = function(id) {
    var models = this.models,
        currentModel;
    for (var i in models) {
      currentModel = models[i];
      if (currentModel.id === id) {
        return currentModel;
      }
    }
  };
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
  var Model = function Base(id_or_attributes, attributes) {
        var model,
            klass = arguments.callee;
        while (klass.caller.name === 'Child') {
          klass = klass.caller;
        }
        if (this instanceof Model) {
          if (typeof attributes == 'undefined') {
            if (typeof id_or_attributes === 'number') {
              this.id = id_or_attributes;
              this.attributes = {};
            } else {
              this.attributes = id_or_attributes || {};
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
          if (typeof this.id !== 'undefined' && typeof klass.dataset.find(this.id) !== 'undefined') {
            throw Error('Jailed in! Do not use `new Model()` to instantiate with id. Use `Model(id, attributes)`');
          }
          this.setup();
          this.klass = klass;
          klass.dataset.add(this);
        } else {
          if (typeof id_or_attributes === 'number') {
            if (attributes instanceof klass) {
              model = attributes;
              model.id = id_or_attributes;
              klass.remove(id_or_attributes);
              klass.dataset.add(model);
            } else if (attributes === null) {
              klass.remove(id_or_attributes);
            } else if (typeof (model = klass.find(id_or_attributes)) === 'undefined') {
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
  Model.prototype.get = function(key) {
    var val, composer;
    val = this.attributes[key];
    if (typeof val === 'undefined' && typeof (composer = this.klass.composers[key]) !== 'undefined') {
      val = composer.apply(this.attributes);
    }
    return val;
  };
  Model.prototype.setup = function() {
    var _this = this;
    this.queue = new Queue(function(cb) {
      cb.apply(_this);
    });
  };
  Model.find = function(id) {
    return this.dataset.find(id);
  };
  Model.add = function(model) {
    return this.dataset.add(model);
  };
  Model.remove = function(model) {
    return this.dataset.remove(model);
  };
  Model.prototype.synced = function(cb) {
    this.queue.push(cb);
  };
  Model.extend = function(proto) {
    var _super = this, klass;
    klass = function Child() {
      return _super.apply(this, arguments);
    };
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
    for (i in this.QueryMethods) {
      klass[i] = this.QueryMethods[i];
    }
    klass.extend = this.extend;
    klass.dataset = new Dataset(klass);
    klass.composers = {};
    return klass;
  };
  Model.QueryMethods = 'all limit page where'.split(' ').reduce(function(memo, methodName) {
    memo[methodName] = function() {
      var query = new Query(this);
      return query[methodName].apply(query, arguments);
    };
    return memo;
  }, {});
  Model.fetch = function() {
    return this.all().query();
  };
  Model.count = function() {
    return this.dataset.models.length;
  };
  Model.empty = function() {
    this.dataset.empty();
  };
  Model.compose = function(key, composer) {
    if (typeof composer === 'function') {
      this.composers[key] = composer;
    }
  };
  Model.mergeModels = function() {
    var mergeModel, reducer, attributeSets;
    reducer = function(memo, model) {
      memo.push(model.attributes);
      return memo;
    };
    attributeSets = Array.prototype.reduce.apply(arguments, [reducer, []]);
    mergeModel = new this();
    attributeSets.unshift(mergeModel.attributes);
    $.extend.apply($, attributeSets);
    return mergeModel;
  };
  Model.dataset = new Dataset(Model);
  Model.composers = {};

  window.Queue = Jails.Queue = Queue;
  window.Query = Jails.Query = Query;
  window.Dataset = Jails.Dataset = Dataset;
  window.Model = Jails.Model = Model;
  window.Jails = Jails;
})({});
