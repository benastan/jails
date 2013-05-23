module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.initConfig({
    pgk: grunt.file.readJSON('package.json'),
    watch: {
      files: [
        'src/**/*'
      ],
      tasks: [
        'concat:jails'
      ]
    },
    concat: {
      jails: {
        options: {
          banner: ";(function(Jails) {\n",
          footer: "}({}));"
        },
        src: [
          'src/jails/utility.js',
          'src/jails/queue.js',
          'src/jails/dataset.js',
          'src/jails/ajax_data_source.js',
          'src/jails/http_data_source.js',
          'src/jails/query.js',
          'src/jails/model.js',
          'src/jails.js'
        ],
        dest: 'lib/jails.js'
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
