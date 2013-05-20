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
  return this.dataset.count();
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
