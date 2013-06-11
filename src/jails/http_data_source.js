var url = require('url'),
    http = require('http'),
    HTTPDataSource = function(options) {
      var method, host, path, data, callback,
          settings = {}, uri, data_source;
      data_source = arguments.callee;
      uri = url.parse(options.url);
      settings.method = options.type.toUpperCase();
      settings.host = uri.host;
      settings.path = uri.pathname;
      settings.port = uri.port || 80;
      data_source.request(settings, options.success, options.error);
    };
HTTPDataSource.request = function(settings, success, error) {
  var str, req;
  str = '';
  req = http.request(settings, function(res) {
    res.on('data', function(chunk) {
      str += chunk.toString();
    });
    res.on('end', function() {
      if (typeof success === 'function') {
        success(str, res);
      }
    });
  });
  req.on('error', function(e) {
    if (typeof error === 'function') {
      error(e);
    }
  });
  req.end();
};
Jails.dataSource = Jails.dataSource || HTTPDataSource;
