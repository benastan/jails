begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end

task :setup do
  %x(bundle)
  %x(npm install)
  %x(npm install -g bower)
  %x(bower install)
end

task :release do
  %x(grunt concat:client)
  %x(grunt concat:server)
  %x(grunt uglify:jails)
  %x(gzip -c lib/jails.min.js > lib/jails.min.js.gz)
end

namespace :test do
  task :client do
    %x(open public/index.html)
  end

  task :server do
    %x(mocha test/server/test.js)
  end
end
