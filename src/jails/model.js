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
  var attrs = {};
  if (typeof key === 'string' || typeof key === 'number') {
    attrs[key] = val;
    this.set(attrs);
  } else {
    for (var i in key) {
      val = key[i];
      this.trigger('change:'+i, val);
    }
    this.trigger('change', key);
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
Model.prototype.save = function() {
  var options = {
    type: this.id ? 'PUT' : 'POST',
    url: typeof this.url === 'function' ? this.url() : this.url,
    data: this.toHash(),
    success: function(res) {
      attrs = JSON.parse(res);
      this.trigger('save');
      this.set(attrs);
    },
    error: function() {
      var args;
      args = Array.prototype.slice.apply(arguments);
      args.unshift('save');
      this.trigger('error', args);
    }
  };
};
Model.prototype.on = function(eventName, cb) {
  var model, events;
  model = this;
  events = this.events[eventName] || (this.events[eventName] = new Queue(function(cb) { cb.call(this); }));
  events.push(cb);
};
Model.prototype.off = function(eventName, cb) {
  var events;
  if ((events = this.events[eventName]) instanceof Queue) {
    events.clear();
  }
};
Model.prototype.toHash = function() {
  var attrs = this.attributes, composer;
  for (var key in this.composers) {
    attrs[key] = this.get(key);
  }
  return attrs;
};
Model.prototype.trigger = function(eventName, arg1, arg2, etc) {
  var additionalArgs, model, events;
  additionalArgs = Array.prototype.slice.apply(arguments);
  model = this;
  eventName = additionalArgs.shift();
  if ((events = this.events[eventName]) instanceof Queue) {
    events.wrapper = function(cb) { cb.apply(model, additionalArgs); };
    events.trigger(additionalArgs);
  }
};
Model.prototype.setup = function() {
  var _this = this;
  this.events = {};
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
          var model = this, object;
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
