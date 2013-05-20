describe("Jails.Dataset", function() {
  var Klass, dataset, model;
  Klass = Model.extend();
  afterEach(function() {
    delete dataset;
    delete model;
  });
  describe("#constructor", function() {
    var query;
    beforeEach(function() {
      query = Klass.all();
    });
    describe("argument is a query", function() {
      beforeEach(function() {
        dataset = Dataset(query);
      });
      it("sets model and query", function() {
        expect(dataset.model).toEqual(Klass);
        expect(dataset.query).toEqual(query);
      });
    });
    describe("first argument is a model", function() {
      beforeEach(function() {
        dataset = Dataset(Klass);
      });
      it("sets model only", function() {
        expect(dataset.model).toEqual(Klass);
      });
    });
  });
  describe("#add", function() {
    beforeEach(function() {
      model = Klass();
      countBefore = dataset.count();
    });
    it("adds a model to a dataset", function() {
      expect(dataset.count()).toEqual(0);
      dataset.add(model);
      expect(dataset.count()).toEqual(1);
    });
  });
  describe("#count", function() {
    var expectCountToEqualModelsLength = function() {
      expect(dataset.count()).toEqual(dataset.models.length);
    };
    beforeEach(function() {
      model = Klass();
      dataset = Dataset(Klass);
    });
    it("equals the length of models property", function() {
      expectCountToEqualModelsLength();
      dataset.add(model);
      expectCountToEqualModelsLength();
    });
  });
  describe("#remove", function() {
    var expectCount = function(count) {
          expect(dataset.count()).toEqual(count);
        },
        id;
    beforeEach(function() {
      model = Klass(id);
      dataset = Dataset(Klass);
      dataset.add(model);
    });
    describe("id as parameter", function() {
      it("removes model with the id from the dataset", function() {
        expectCount(1);
        dataset.remove(id);
        expectCount(0);
      });
    });
    describe("model as parameter", function() {
      it("removes the model from the dataset", function() {
        expectCount(1);
        dataset.remove(model);
        expectCount(0);
      });
    });
  });
});
