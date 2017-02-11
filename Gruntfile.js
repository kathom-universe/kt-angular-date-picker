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
        src: ['html/**/*.html', 'html/**/*.svg'],
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
    },
    svgstore: {
      default : {
        files: {
          'html/kt-date-picker-icons.svg': [
            'bower_components/material-design-icons/action/svg/production/ic_date_range_24px.svg',
            'bower_components/material-design-icons/navigation/svg/production/ic_chevron_left_18px.svg',
            'bower_components/material-design-icons/navigation/svg/production/ic_chevron_right_18px.svg'
          ]
        },
        options: {
          formatting: {
            wrap_line_length: 120
          },
          convertNameToId: function(name) {
            name = name.slice(3); // remove the ic_ prefix
            name = name.slice(0, -2); // remove the px
            return name;
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-svgstore');

  grunt.registerTask('build-css', ['sass', 'postcss']);
  grunt.registerTask('default', ['watch']);
};
