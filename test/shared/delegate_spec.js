describe('Delegate', function() {
  var Delegate = Jails.Delegate,
      Target = function() {
        new Delegate(this);
        this.delegate(delegateMethods, {
          to: function() {
            return this.delegateTo;
          }
        });
        this.delegateTo = delegate;
      },
      delegateMethods = 'f1',
      Inherited = function() { Target.call(this); },
      delegate = {
        fn1: function() { fn1Ran = true; },
        fn2: function() { fn2Ran = true; }
      },
      fn1Ran, fn2Ran;
  Inherited.prototype = new Target();
  Inherited.constructor = Target;
  beforeEach(function() {
    fn1Ran = false;
    fn2Ran = false;
  });
  describe('delegate', function() {
    var target;
    describe('pass a string', function() {
      beforeEach(function() {
        delegateMethods = 'fn1';
        target = new Target();
        target.fn1();
      });
      it('delegates fn1', function() {
        expect(fn1Ran).to.be(true);
      });
    });
    describe('pass an array', function() {
      beforeEach(function() {
        delegateMethods = ['fn1', 'fn2'];
        target = new Target();
        target.delegateTo = delegate;
        target.fn1();
        target.fn2();
      });
      it('delegates both', function() {
        expect(fn1Ran).to.be(true);
        expect(fn2Ran).to.be(true);
      });
    });
    describe('inherited delegation', function() {
      var otherFn1Ran, otherFn2Ran,
          otherDelegate = {
            fn1: function() { otherFn1Ran = true; },
            fn2: function() { otherFn2Ran = true; }
          };
      beforeEach(function() {
        delegateMethods = ['fn1', 'fn2'];
        otherFn1Ran = false;
        otherFn2Ran = false;
        target = new Inherited();
        target.delegateTo = otherDelegate;
        target.fn1();
        target.fn2();
      });
      it("delegates to otherDelegate", function() {
        expect(fn1Ran).to.be(false);
        expect(fn2Ran).to.be(false);
        expect(otherFn1Ran).to.be(true);
        expect(otherFn2Ran).to.be(true);
      });
    });
  });
});
