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
    queue = new Queue(callbackWrapper);
  });
  afterEach(function() {
    queue = undefined;
  });
  describe('#constructor', function() {
    it("is initialized with a wrapper and a queue", function() {
      expect(queue.wrapper).toEqual(callbackWrapper);
      expect(queue.queue).toEqual([]);
    });
  });
  describe("#push", function() {
    beforeEach(function() {
      queue.push(queuedCallback);
    });
    it("pushes queuedCallback into the queue", function() {
      expect(queue.queue.length).toEqual(1);
    });
  });
  describe("#flush", function() {
    beforeEach(function() {
      queue.push(queuedCallback);
      queue.flush();
    });
    it("runs all queued callbacks", function() {
      expect(assignedContext).toEqual(contextForCallback);
      expect(someVariable).toEqual(firstArgument);
    });
  });
});
