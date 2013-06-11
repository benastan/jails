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
              expect(model instanceof Model).to.equal(true);
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
                expect(model.id).to.equal(id);
              });
            });
            describe("model with id does exist", function() {
              var savedModel;
              beforeEach(function() {
                savedModel = Model(id, attributes);
              });
              beforeEach(generateModelWithIdFromAttributes);
              it("returns the saved model", function() {
                expect(model).to.equal(savedModel);
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
              expect(Model.find(id)).not.to.be(undefined);
              expect(model.id).to.equal(id);
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
              expect(modelCountBefore).to.be.greaterThan(0);
              expect(Model.count()).to.equal(modelCountBefore);
              expect(model.id).to.equal(id);
            });
          });
          describe("hash as second parameter", function() {
            beforeEach(function() {
              model = Model(id, { name: 'ben' });
            });
            it("sets the attributes", function() {
              expect(model.get('name')).to.equal('ben');
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
            expect(model instanceof Model).to.equal(true);
            expect(model.id).to.equal(id);
          });
        });
      });
      describe("#find", function() {
        beforeEach(function() {
          Model(1);
          Model(2);
        });
        it("finds model with a given id", function() {
          expect(Model.find(1).id).to.equal(1);
          expect(Model.find(2).id).to.equal(2);
        });
      });
      describe("#remove", function() {
        beforeEach(function() {
          Model(1);
          Model(2);
        });
        it("removes model with given id", function() {
          expect(Model.count()).to.equal(2);
          Model.remove(1);
          expect(Model.find(1)).to.be(undefined)
        });
        it("removes given model", function() {
          expect(Model.count()).to.equal(2);
          Model.remove(Model(1));
          expect(Model.find(1)).to.be(undefined)
        });
      });
      describe("#empty", function() {
        beforeEach(function() {
          Model(1);
        });
        it("empties Model.models", function() {
          expect(Model.count()).to.equal(1);
          Model.empty();
          expect(Model.count()).to.equal(0);
        });
      });
      describe("#count", function() {
        describe("default value", function() {
          it("is zero", function() {
            expect(Model.count()).to.equal(0);
          });
        });
        describe("one model", function() {
          beforeEach(function() {
            Model(1);
          });
          it("is one", function() {
            expect(Model.count()).to.equal(1);
          });
        });
      });
      describe("#mergeModels", function() {
        var conflictModel, mergeModel;
        beforeEach(function(){
          conflictModel = Model(1, {name: 'ben'});
          model = Model(1, {name: 'benjamin'});
          mergeModel = Model.mergeModels(model, conflictModel);
        });
        it("merges two models", function() {
          expect(mergeModel.get('name')).to.equal('ben');
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
          expect(Model.composers.fullName).to.equal(fullNameComposer);
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
          expect(model.get('firstName')).to.equal('ben');
        });
        it("composes full name", function() {
          expect(model.get('fullName')).to.equal('ben bergstein');
        });
      });
      describe("event handling", function() {
        var testVar, otherTestVar, model,
            eventName = 'someevent',
            otherEventName = 'someotherevent',
            handler = function() { testVar = true; },
            otherHandler = function() { otherTestVar = true; },
            key = 'somekey',
            val = 'someval', attrs;
        beforeEach(function() {
          testVar = false;
          otherTestVar = false;
          model = Model();
          model.on(eventName, handler);
          model.on(otherEventName, otherHandler);
          attrs = {};
        });
        describe("#on, #trigger", function() {
          beforeEach(function() {
            model.trigger(eventName);
          });
          it('runs the handler when triggered', function() {
            expect(eventName === otherEventName).to.be(false);
            expect(testVar).to.be(true);
            expect(otherTestVar).to.be(false);
          });
        });
        describe("#off", function() {
          beforeEach(function() {
            model.off(eventName);
            model.trigger(eventName);
          });
          it('does not run the handler', function() {
            expect(testVar).to.be(false);
          });
        });
        describe("#set", function() {
          beforeEach(function() {
            model.on('change', handler);
          });
          it("triggers the handler when an attribute is set", function() {
            model.set(key, val);
            expect(testVar).to.be(true);
          });
          it("triggers the handler when attributes are set", function() {
            model.set();
            expect(testVar).to.be(true);
          });
          it("passes the changes as an argument", function(done) {
            attrs[key] = val;
            attrs.otherKey = 'somethingElse';
            model.on('change:'+key, function(key, val) {
              expect(key).to.be(key);
            });
            model.on('change', function(attrs) {
              expect(attrs[key]).to.be(val);
              done();
            });
            model.set(attrs);
          });
        });
      });
    };

describe("Jails.Model", function() {
  ModelTests(Jails.Model);
});
describe("ExtendedModel", function() {
  var ExtendedModel = Jails.Model.extend();
  ModelTests(ExtendedModel);
});
