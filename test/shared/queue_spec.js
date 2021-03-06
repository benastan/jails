describe("Jails.Queue", function() {
  var queuedCallback = function() {
        assignedContext = this;
        someVariable = arguments[0];
      },
      firstArgument = "Hello!",
      callbackWrapper = function(cb) {
        cb.apply(contextForCallback, [ firstArgument ]);
      },
      contextForCallback = new Date(),
      assignedContext, someVariable, queue, undefined;
  beforeEach(function() {
    queue = new Jails.Queue(callbackWrapper);
  });
  afterEach(function() {
    queue = undefined;
  });
  describe('#constructor', function() {
    it("is initialized with a wrapper and a queue", function() {
      expect(queue.wrapper).to.be(callbackWrapper);
      expect(queue.queue.length).to.be(0);
      expect(queue.queue).to.be.a('array');
    });
  });
  describe("#push", function() {
    beforeEach(function() {
      queue.push(queuedCallback);
    });
    it("pushes queuedCallback into the queue", function() {
      expect(queue.queue.length).to.be(1);
    });
  });
  describe("#flush", function() {
    beforeEach(function() {
      queue.push(queuedCallback);
      queue.flush();
    });
    it("runs all queued callbacks", function() {
      expect(assignedContext).to.be(contextForCallback);
      expect(someVariable).to.be(firstArgument);
    });
  });
});
