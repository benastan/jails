module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.initConfig({
    pgk: grunt.file.readJSON('package.json'),
    watch: {
      files: [
        'Gruntfile.js',
        'public/index.html',
        'src/**/*',
        'test/**/*',
        'spec/**/*'
      ],
      tasks: [
        'concat:client',
        'concat:server',
        'concat:test',
        'copy:test'
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
          'test/client/test.js',
          'test/shared/model_spec.js',
          'test/shared/dataset_spec.js',
          'test/shared/queue_spec.js'
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
    },
    copy: {
      test: {
        files: [{
          src: ['node_modules/mocha/mocha.css'],
          dest: 'public/mocha.css'
        }]
      }
    }
  });
  grunt.registerTask('default', ['concat:jails']);
};
