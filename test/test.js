var Jails = require('../lib/jails'),
    expect = require('expect.js');

describe("HTTPDataSource", function() {
  var options, request;
  afterEach(function() {
    var undefined;
    options = undefined;
  });
  describe("requesting something", function() {
    it("requests data", function(done) {
      options = {
        type: 'get',
        url: 'http://www.google.com',
        success: function(res) {
          expect(res).to.be.a('string');
          done();
        },
        error: function() {
          done();
        }
      };
      request = Jails.HTTPDataSource(options);
    });
  });
});
