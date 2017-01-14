module.exports = function(grunt) {

  grunt.initConfig({
    sass: {
      options: {
        outputStyle: 'expanded',
        sourceMap  : true
      },
      dist: {
        files: {
          'kt-angular-date-picker.css'           : 'scss/kt-angular-date-picker.scss',
          'kt-angular-date-picker.standalone.css': 'scss/kt-angular-date-picker.standalone.scss'
        }
      }
    },
    postcss: {
      options: {
        map: {
          inline: true
        },
        processors: [
          require('autoprefixer')({browsers: 'last 3 versions'})
        ]
      },
      dist: {
        src: '*.css'
      }
    },
    watch: {
      css: {
        files: ['scss/**/*.scss'],
        tasks: ['build-css']
      },
      html: {
        files: ['html/**/*.html'],
        tasks: ['html2js']
      },
      js: {
        files: ['js/**/*.js'],
        tasks: ['concat']
      }
    },
    html2js: {
      options: {
        base: 'html',
        module: 'kt.datePicker',
        singleModule: true,
        existingModule: true,
        rename: function (moduleName) {
          return 'html/' + moduleName;
        }
      },
      main: {
        src: ['html/**/*.html'],
        dest: 'js/template/template-cache.js'
      }
    },
    concat: {
      dist: {
        options: {
          banner: "(function (){\n  'use strict';",
          footer: "})();\n",
          process: function(src) {
            var processedSrc = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");/g, '');
            processedSrc = processedSrc.replace(/(\(function\s*\(\)\s*\{)/, '');
            processedSrc = processedSrc.replace(/(\}\)\(\));/, '');
            return processedSrc;
          }
        },
        files: {
          'kt-angular-date-picker.js': [
            'js/kt-date-picker.module.js',
            'js/services/*.js',
            'js/filters/*.js',
            'js/directives/*.js',
            'js/template/template-cache.js'
          ],
          'kt-angular-date-picker.standalone.js': [
            'bower_components/kt-angular-util/kt-angular-util.js',
            'bower_components/kt-angular-dropdown/kt-angular-dropdown.js',
            'js/kt-date-picker.module.js',
            'js/services/*.js',
            'js/filters/*.js',
            'js/directives/*.js',
            'js/template/template-cache.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('build-css', ['sass', 'postcss']);
  grunt.registerTask('default', ['watch']);
};
