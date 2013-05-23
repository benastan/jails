describe("HTTPDataSource", function() {
  var options;
  afterEach(function() {
    var undefined;
    options = undefined;
  });
  describe("requesting something", function() {
    it("requests data", function(done) {
      options = {
        type: 'get',
        url: 'http://www.google.com',
        success: function() {
          expect(res).to.be.a('string');
          done();
        }
      };
      request = HTTPDataSource.request(options);
    });
  });
});
