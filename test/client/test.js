mocha.setup('bdd');
describe('test', function() {
  it("works", function() {
    expect(true).to.be(true);
    expect(Jails).to.be.a('object');
  });
});

