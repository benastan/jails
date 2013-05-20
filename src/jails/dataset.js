var Dataset = function(model_or_query) {
      var model;
      if (this instanceof Dataset) {
        if (model_or_query instanceof Query) {
          this.query = model_or_query;
          this.model = model_or_query.model;
        } else {
          this.model = model_or_query;
        }
        this.models = [];
      } else {
        return new Dataset(model_or_query);
      }
    };
Dataset.prototype.count = function() {
  return this.models.length;
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
