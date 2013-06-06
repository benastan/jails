var ModelTests = function(Model) {
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
          var instantiateModel = function() {
                model = Model(id);
              };
          afterEach(function() {
            Model(id, null);
          });
          describe("model with id does not exist", function() {
            beforeEach(instantiateModel);
            it("instantiates model with id", function() {
              expect(Model.find(id)).not.toBeUndefined();
              expect(model.id).toEqual(id);
            });
          });
          describe("model with id exists", function() {
            var modelCountBefore, preExistingModel;
            beforeEach(function() {
              preExistingModel = Model(id);
              modelCountBefore = Model.count();
            });
            beforeEach(instantiateModel);
            it("retrieves the model", function() {
              expect(modelCountBefore).toBeGreaterThan(0);
              expect(Model.count()).toEqual(modelCountBefore);
              expect(model.id).toEqual(id);
            });
          });
          describe("hash as second parameter", function() {
            beforeEach(function() {
              model = Model(id, { name: 'ben' });
            });
            it("sets the attributes", function() {
              expect(model.get('name')).toEqual('ben');
            });
          });
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
      describe("#find", function() {
        beforeEach(function() {
          Model(1);
          Model(2);
        });
        it("finds model with a given id", function() {
          expect(Model.find(1).id).toEqual(1);
          expect(Model.find(2).id).toEqual(2);
        });
      });
      describe("#remove", function() {
        beforeEach(function() {
          Model(1);
          Model(2);
        });
        it("removes model with given id", function() {
          expect(Model.count()).toEqual(2);
          Model.remove(1);
          expect(Model.find(1)).toBeUndefined();
        });
        it("removes given model", function() {
          expect(Model.count()).toEqual(2);
          Model.remove(Model(1));
          expect(Model.find(1)).toBeUndefined();
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
      describe("#mergeModels", function() {
        var conflictModel;
        beforeEach(function(){
          conflictModel = Model(1, {name: 'ben'});
          model = Model(1, {name: 'benjamin'});
          mergeModel = Model.mergeModels(model, conflictModel);
        });
        it("merges two models", function() {
          expect(mergeModel.get('name')).toEqual('ben');
        });
      });
      var fullNameComposer = function() {
        return [this.firstName, this.lastName].join(' ');
      };
      describe("#compose", function() {
        beforeEach(function() {
          Model.compose('fullName', fullNameComposer);
        });
        afterEach(function() {
          Model.composers = {};
        });
        it("add composer to composers hash", function() {
          expect(Model.composers.fullName).toEqual(fullNameComposer);
        });
      });
      describe("#get", function() {
        beforeEach(function(){
          Model.compose('fullName', fullNameComposer);
          model = Model(1, { firstName: 'ben', lastName: 'bergstein' });
        });
        afterEach(function() {
          Model.composers = {};
        });
        it("gets a requested attribute", function() {
          expect(model.get('firstName')).toEqual('ben');
        });
        it("composes full name", function() {
          expect(model.get('fullName')).toEqual('ben bergstein');
        });
      });
    };

describe("Jails.Model", function() {
  ModelTests(Model);
});
describe("ExtendedModel", function() {
  ExtendedModel = Model.extend();
  ModelTests(ExtendedModel);
});
