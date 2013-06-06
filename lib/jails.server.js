;(function(Jails) {
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

var Dataset = function(model_or_query) {
      var dataset;
      dataset =  function() {
        return (function(arg) {
          if (typeof arg === 'number') {
            return this.find(arg);
          } else if (arg instanceof Object) {
            return this.filter(arg);
          }
        }.apply(dataset, arguments));
      };
      DatasetConstructor.call(dataset, model_or_query);
      $.extend(dataset, Dataset.prototype);
      return dataset;
    },
    DatasetConstructor = function(model_or_query) {
      if (model_or_query instanceof Query) {
        this.query = model_or_query;
        this.model = model_or_query.model;
      } else {
        this.model = model_or_query;
      }
      this.models = [];
    };
Dataset.prototype.count = function() {
  return this.models.length;
};
Dataset.prototype.add = wrap(function(model) {
  var preExistingModel, mergeModel, addMany;
  if (arguments.length > 1) {
    model = Array.prototype.slice.apply(arguments);
  }
  if (model instanceof Array) {
    for (var i in model) {
      this.add(model[i]);
    }
  } else if (model instanceof this.model) {
    if (typeof model.id !== 'undefined' && (preExistingModel = this.find(model.id)) instanceof this.model) {
      this.remove(preExistingModel);
      model = this.model.mergeModels(preExistingModel, model);
      model.id = model.id;
    }
    this.models.push(model);
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
Dataset.prototype.clone = function(models) {
  var dataset;
  dataset = Dataset(this.model, this.query);
  models = models || this.models;
  for (var i in models) {
    dataset.add(models[i]);
  };
  return dataset;
};
Dataset.prototype.filter = function(key, val) {
  var dataset = this.clone(),
      models = dataset.models,
      args = {},
      currentModel, modelAttrVal, rejectCurrentModel,
      newIndex;
  if (typeof key === 'string' && typeof val !== 'undefined') {
    args[key] = val;
  } else if (args instanceof Object) {
    args = key;
  } else {
    throw ArgumentError("Dataset::filter takes either two strings, or one hash of parameters");
  }
  for (var i in models) {
    currentModel = models[i];
    newIndex = models.index(currentModel);
    for (key in args) {
      val = args[key];
      modelAttrVal = currentModel.get(key);
      if ((typeof val === 'string' && val != modelAttrVal) || (val instanceof RegExp && val.test(modelAttrVal) === false)) {
        models.splice(newIndex, 1);
      }
    }
  }
  dataset.models = models;
  return dataset;
};
Dataset.prototype.at = function(index) {
  return Dataset.models[index];
};
Dataset.prototype.first = function() {
  return this.at(0);
};
Dataset.prototype.last = function() {
  return this.at(this.count());
}

var url = require('url'),
    http = require('http'),
    HTTPDataSource = function(options) {
      var method, host, path, data, callback,
          settings = {}, uri, data_source;
      data_source = arguments.callee;
      uri = url.parse(options.url);
      settings.method = options.type.toUpperCase();
      settings.host = uri.host;
      settings.path = uri.pathname;
      settings.port = uri.port || 80;
      data_source.request(settings, options.success, options.error);
    };
HTTPDataSource.request = function(settings, success, error) {
  var str, req;
  str = '';
  req = http.request(settings, function(res) {
    res.on('data', function(chunk) {
      str += chunk;
    });
    res.on('end', function() {
      if (typeof success === 'function') {
        success(str);
      }
    });
  });
  req.on('error', function(e) {
    if (typeof error === 'function') {
      error(e);
    }
  });
  req.end();
};
Jails.dataSource = Jails.dataSource || HTTPDataSource;

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
  Jails.dataSource({
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
  $.extend(klass, Model, proto);
  klass.extend = this.extend;
  klass.dataset = new Dataset(klass);
  klass.composers = {};
  return klass;
};
var DelegatedMethodsWithObjects = {
  'all limit page where': function() {
    return new Query(this);
  },
  'count add remove find empty filter first last at': function() { return this.dataset; }
};
var DelegatedMethods = (function(methods) {
  var keys = (function(memo) {
        for (var i in methods) {
          memo.push(i);
        }
        return memo;
      }([]));
  return keys.reduce(function(memo, key) {
    var methodNames = key.split(' ');
    for (var i in methodNames) {
      memo[methodNames[i]] = (function(objectMethod, methodName) {
        return function() {
          var model = this;
          object = objectMethod.apply(model);
          return object[methodName].apply(object, arguments);
        };
      }(methods[key], methodNames[i]));
    }
    return memo;
  }, {});
}(DelegatedMethodsWithObjects));
$.extend(Model, DelegatedMethods);
Model.fetch = function() {
  return this.all().query();
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

Jails.Queue = Queue;
Jails.Query = Query;
Jails.Dataset = Dataset;
Jails.Model = Model;
}({}));