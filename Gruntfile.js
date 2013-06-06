module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.initConfig({
    pgk: grunt.file.readJSON('package.json'),
    watch: {
      files: [
        'src/**/*',
        'test/**/*',
        'spec/**/*'
      ],
      tasks: [
        'concat:client',
        'concat:server',
        'concat:test'
      ]
    },
    concat: {
      client: {
        options: {
          banner: ";(function() {\n",
          footer: "}());"
        },
        src: [
          'src/jails/utility.js',
          'src/jails/queue.js',
          'src/jails/dataset.js',
          'src/jails/ajax_data_source.js',
          'src/jails/query.js',
          'src/jails/model.js',
          'src/jails.js'
        ],
        dest: 'lib/jails.js'
      },
      server: {
        options: {
          banner: ";(function(Jails) {\n",
          footer: "}({}));"
        },
        src: [
          'src/jails/utility.js',
          'src/jails/queue.js',
          'src/jails/dataset.js',
          'src/jails/http_data_source.js',
          'src/jails/query.js',
          'src/jails/model.js',
          'src/jails.js'
        ],
        dest: 'lib/jails.server.js'
      },
      test: {
        src: [
          'bower_components/jquery/jquery.js',
          'node_modules/expect.js/expect.js',
          'node_modules/mocha/mocha.js',
          'lib/jails.js',
          'test/client/test.js'
        ],
        dest: 'public/test.js'
      }
    },
    uglify: {
      options: {
        sourceMap: 'lib/jails.min.map'
      },
      jails: {
        files: {
          'lib/jails.min.js': [ 'lib/jails.js' ]
        }
      }
    }
  });
  grunt.registerTask('default', ['concat:jails']);
};
