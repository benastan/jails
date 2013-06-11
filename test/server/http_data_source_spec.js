var nock = require('nock'),
    Nockstream = require('nockstream');
describe("HTTPDataSource", function() {
  describe("basics", function() {
    var HTTPDataSource = Jails.dataSource,
        streamString = "Hello, World";
    describe("#request", function() {
      var request, stream;
      beforeEach(function() {
        stream = new Nockstream({
          streamString: streamString
        });
        nock('http://www.google.com').get('/').reply(404, stream);
      });
      it("does something", function(done) {
        request = HTTPDataSource({
          type: 'GET',
          url: "http://www.google.com/",
          success: function(str) {
            expect(str).to.be(streamString);
            done();
          },
          error: function() {
            console.log('error');
          }
        });
      });
    });
  });
  describe("query/dataset integration", function() {
    var Model = Jails.Model,
        Dataset = Jails.Dataset,
        model;
    describe("query all", function() {
      var query, responseBody;
      beforeEach(function() {
        Model.url = "http://localhost/models";
        model = Model({ name: 'my model' });
        responseBody = new Nockstream({streamString: JSON.stringify([ model.attributes ])});
        nock("http://localhost").get("/models").reply(200, responseBody);
        query = Model.all();
      });
      it("queries all", function(done) {
        query.query(function() {
          expect(this.dataset.at(0).get('name')).to.be(model.get('name'));
          done();
        });
      });
    });
  });
});
