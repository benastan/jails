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
    %x(grunt concat:test)
    %x(open public/index.html)
  end

  task :server do
    %x(mocha test/server/test.js)
  end
end

task :default => [:'test:server']
