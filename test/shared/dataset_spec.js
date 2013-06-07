describe("Jails.Dataset", function() {
  var Klass, dataset, model;
  Klass = Jails.Model.extend();
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
        dataset = Jails.Dataset(query);
      });
      it("sets model and query", function() {
        expect(dataset.model).to.be(Klass);
        expect(dataset.query).to.be(query);
      });
    });
    describe("first argument is a model", function() {
      beforeEach(function() {
        dataset = Jails.Dataset(Klass);
      });
      it("sets model only", function() {
        expect(dataset.model).to.be(Klass);
      });
    });
  });
  describe("#add", function() {
    var countBefore;
    beforeEach(function() {
      model = Klass();
      dataset = Jails.Dataset(Klass);
      countBefore = dataset.count();
    });
    afterEach(function() {
      delete dataset;
    });
    describe("adding one model", function() {
      it("adds a model to a dataset", function() {
        expect(dataset.count()).to.be(0);
        dataset.add(model);
        expect(dataset.count()).to.be(1);
      });
    });
    describe("adding many models", function() {
      it("adds many from array as first parameter", function() {
        expect(countBefore).to.be(0);
        dataset.add([Klass(1), Klass(2), Klass(3)]);
        expect(dataset.count()).to.be(3);
      });
      it("adds many from arguments", function() {
        expect(countBefore).to.be(0);
        dataset.add(Klass(1), Klass(2), Klass(3));
        expect(dataset.count()).to.be(3);
      });
    });
  });
  describe("#count", function() {
    var expectCountToEqualModelsLength = function() {
      expect(dataset.count()).to.be(dataset.models.length);
    };
    beforeEach(function() {
      model = Klass();
      dataset = Jails.Dataset(Klass);
    });
    it("equals the length of models property", function() {
      expectCountToEqualModelsLength();
      dataset.add(model);
      expectCountToEqualModelsLength();
    });
  });
  describe("#remove", function() {
    var expectCount = function(count) {
          expect(dataset.count()).to.be(count);
        }, id;
    beforeEach(function() {
      model = Klass(id);
      dataset = Jails.Dataset(Klass);
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
  describe("#find", function() {
    var id;
    beforeEach(function() {
      id = 1;
      model = Klass(id);
      dataset = Jails.Dataset(Klass);
      dataset.add(model);
    });
    it("finds model with id", function() {
      expect(dataset.find(id)).to.be(model);
    });
  });
  describe("#clone", function() {
    var cloneModel, id;
    beforeEach(function() {
      id = 1;
      model = Klass(id);
      dataset = Jails.Dataset(Klass);
      dataset.add(model);
    });
    describe("dataset with no query", function() {
      var cloneDataset;
      beforeEach(function() {
        cloneDataset = dataset.clone();
      });
      it("returns a dataset with the same attributes", function() {
        expect(cloneDataset.count()).to.be(dataset.count());
        expect(cloneDataset.at(0)).to.be(dataset.at(0));
        expect(cloneDataset.model).to.be(dataset.model);
        expect(cloneDataset.query).to.be(dataset.query);
        expect(cloneDataset === dataset).to.be(false);
      });
    });
    //describe("dataset with query");
  });
  describe("#filter", function() {
    var modelThatMatchesWhere, modelThatDoesNotMatchWhere,
        filteredDataset, filterParams, filterParamsKey, filterParamsVal,
        filteredByHashDataset, filteredByKeyValDataset;
    beforeEach(function() {
      dataset = Jails.Dataset(Klass);
      filterParams = {};
      filterParams[filterParamsKey] = filterParamsVal;
      modelThatMatchesWhere = Klass(1, filterParams);
      modelThatDoesNotMatchWhere = Klass(2, {name: 'toby'});
      dataset.add(modelThatMatchesWhere, modelThatDoesNotMatchWhere);
      filteredByHashDataset = dataset.filter(filterParams);
      filteredByKeyValDataset = dataset.filter(filterParamsKey, filterParamsVal);
    });
    describe("filtering using a hash", function() {
      filterParamsKey = 'name';
      filterParamsVal = 'ben';
      it("filters the collection, returning a clone", function() {
        expect(filteredByHashDataset.count()).to.be(1);
      });
    });
    describe("filtering using key and value", function() {
      describe("value is a string", function() {
        filterParamsKey = 'name';
        filterParamsVal = 'ben';
        it("tests string equivalence", function() {
          expect(filteredByKeyValDataset.count()).to.be(1);
        });
      });
      describe("value is a RegExp", function() {
        filterParamsKey = 'name';
        filterParamsVal = /en^/;
        it("tests string using RegExp.test", function() {
          expect(filteredByKeyValDataset.count()).to.be(1);
        });
      });
    });
  });
  describe("self as function", function() {
    var id;
    beforeEach(function() {
      id = 1;
      model = Klass(id);
      dataset = Jails.Dataset(Klass);
      dataset.add(model);
    });
    describe("integer is first argument", function() {
      it("finds the model", function() {
        expect(dataset(id)).to.be(model);
      });
    });
  });
});
