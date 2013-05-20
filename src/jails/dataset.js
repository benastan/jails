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
      currentModel, modelAttrVal, rejectCurrentModel;
  if (typeof key === 'string' && typeof val !== 'undefined') {
    args[key] = val;
  } else if (args instanceof Object) {
    args = key;
  } else {
    throw ArgumentError("Dataset::filter takes either two strings, or one hash of parameters");
  }
  for (var i in models) {
    currentModel = models[i];
    for (key in args) {
      val = args[key];
      modelAttrVal = currentModel.get(key);
      if ((typeof val === 'string' && val != modelAttrVal) || (val instanceof RegExp && val.test(modelAttrVal) === false)) {
        models.splice(i, 1);
      }
    }
  }
  dataset.models = models;
  return dataset;
};
