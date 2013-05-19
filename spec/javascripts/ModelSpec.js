describe("Jails.Model", function() {
  var id = 1,
      model,
      attributes = {
        name: "ben"
      },
      undefined;
  afterEach(function() {
    model = undefined;
    Model.empty();
  });
  describe("Model()", function() {
    describe("hash as first parameter", function() {
      describe("attributes do not include id", function() {
        beforeEach(function() {
          model = Model(attributes);
        });
        it("creates an anonymous model with attributes", function() {
          expect(model instanceof Model).toBe(true);
        });
      });
      describe("id is an attribute", function() {
        var generateModelWithIdFromAttributes = function() {
          attributes.id = id;
          model = Model(attributes);
        };
        afterEach(function() {
          delete attributes.id;
        });
        describe("model with id doesn't exist", function() {
          beforeEach(generateModelWithIdFromAttributes);
          it("load model with id", function() {
            expect(model.id).toEqual(id);
          });
        });
        describe("model with id does exist", function() {
          var savedModel;
          beforeEach(function() {
            savedModel = Model(id, attributes);
          });
          beforeEach(generateModelWithIdFromAttributes);
          it("returns the saved model", function() {
            expect(model).toEqual(savedModel);
          });
        });
      });
    });
    describe("number as first parameter)", function() {
      beforeEach(function() {
        model = Model(id);
      });
      afterEach(function() {
        Model(id, null);
      });
      describe("model with id does not exist", function() {
        it("instantiates model with id", function() {
          expect(Model.models[id]).not.toBeUndefined();
          expect(model.id).toEqual(id);
        });
      });
      //describe("model with id exists", function() {
        //it("retrieves the model", function() {
          //expect(Model.constructor).not.toHaveBeenCalled();
          //expect(model.id).toEqual(id);
        //});
      //});
    });
  });
  describe("#constructor", function() {
    describe("id as first parameter", function() {
      var id = 1;
      beforeEach(function() {
        model = new Model(id);
      });
      it("instantiates a model with id set", function() {
        expect(model instanceof Model).toEqual(true);
        expect(model.id).toEqual(id);
      });
    });
  });
  describe("#empty", function() {
    beforeEach(function() {
      Model(1);
    });
    it("empties Model.models", function() {
      expect(Model.count()).toEqual(1);
      Model.empty();
      expect(Model.count()).toEqual(0);
    });
  });
  describe("#count", function() {
    describe("default value", function() {
      it("is zero", function() {
        expect(Model.count()).toEqual(0);
      });
    });
    describe("one model", function() {
      beforeEach(function() {
        Model(1);
      });
      it("is one", function() {
        expect(Model.count()).toEqual(1);
      });
    });
  });
});
