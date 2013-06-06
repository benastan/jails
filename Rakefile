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

task :test do
  build
  %x(cp ./lib/jails.js ./public/javascripts/jails.js)
  %x(cp ./node_modules/mocha/mocha.js ./public/javascripts/mocha.js)
  %x(cp ./node_modules/expect.js/expect.js ./public/javascripts/expect.js)
end
