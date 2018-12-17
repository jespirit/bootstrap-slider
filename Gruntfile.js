/*global module:false*/
module.exports = function(grunt) {

  var packageJSON = grunt.file.readJSON('package.json');
  var bumpFiles = ["package.json", "bower.json", "composer.json"];
  var commitFiles = bumpFiles.concat(["./dist/*"]);

  // Project configuration.
  grunt.initConfig({
    // Metadata
    pkg: packageJSON,
    // Task configuration.
    header: {
      dist: {
        options: {
          text: "/*! =======================================================\n                      VERSION  <%= pkg.version %>              \n========================================================= */"
        },
        files: {
          '<%= pkg.gruntConfig.dist.js %>': '<%= pkg.gruntConfig.temp.js %>',
          '<%= pkg.gruntConfig.dist.jsMin %>': '<%= pkg.gruntConfig.temp.jsMin %>',
          '<%= pkg.gruntConfig.dist.css %>': '<%= pkg.gruntConfig.temp.css %>',
          '<%= pkg.gruntConfig.dist.cssMin %>': '<%= pkg.gruntConfig.temp.cssMin %>'
        }
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      dist: {
        src: '<%= pkg.gruntConfig.temp.js %>',
        dest: '<%= pkg.gruntConfig.temp.jsMin %>'
      }
    },
    babel: {
      options: {
        presets: ['es2015']
      },
      dist: {
        src: '<%= pkg.gruntConfig.js.slider %>',
        dest: '<%= pkg.gruntConfig.temp.js %>'
      }
    },
    jshint: {
      ignore_warning: {
        options: {
          '-W099': true
        },
        src: '<%= pkg.gruntConfig.js.slider %>'
      },
      options: {
        // Note: 'deprecated' describes the case of code style or conventions
        // vs. code correctness
        esnext: true,  // ECMAScript 6 syntax (deprecated)
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,  // always define a variable before use
        newcap: true,  // capitalize constructor functions (deprecated)
        noarg: true,
        sub: true,  // person['name'] vs. person.name (deprecated)
        undef: true,
        unused: true,
        // assignment where comparison is expected
        // if (a = 10) {}
        // use case: for (var i = 0, person; person = people[i]; i++) {}
        boss: true,
        eqnull: true,
        // globals exposed by modern browsers
        // ie. document, navigator, HTML5 FileReader
        browser: true,
        // these variables are defined in another file
        globals: {
          $ : true,
          Modernizr : true,
          console: true,
          define: true,
          module: true,
          require: true
        },
        "-W099": true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      js: {
        src: '<%= pkg.gruntConfig.js.slider %>'
      },
      spec : {
        src: '<%= pkg.gruntConfig.spec %>',  // "test/specs/**/*.js"
        options : {
          globals : {
            document: true,
            console: false,
            Slider: false,
            $: false,
            jQuery: false,
            _: false,
            _V_: false,
            afterEach: false,
            beforeEach: false,
            confirm: false,
            context: false,
            describe: false,
            expect: false,
            it: false,
            jasmine: false,
            JSHINT: false,
            mostRecentAjaxRequest: false,
            qq: false,
            runs: false,
            spyOn: false,
            spyOnEvent: false,
            waitsFor: false,
            xdescribe: false
          }
        }
      }
    },
    sasslint: {
      options: {
        configFile: './.sass-lint.yml',
      },
      target: ['./src/sass/**/*.scss']
    },
    lesslint: {
      src: ['./src/less/bootstrap-slider.less']
    },
    jasmine : {
      // Steps:
      // Load 'src' into memory
      src : '<%= pkg.gruntConfig.temp.js %>',
      options : {
        // Run each file in 'spec'
        specs : '<%= pkg.gruntConfig.spec %>',
        // specify jQuery first, bind polyfill, then bootstrap-slider.js, plus all specs
        // <% with (scripts) { %>
        //   <% [].concat(polyfills, jasmine, boot, vendor, helpers, src, specs,reporters).forEach(function(script){ %>
        //     <script src="<%= script %>"></script>
        //   <% }) %>
        // <% }; %>
        vendor : ['<%= pkg.gruntConfig.js.jquery %>', '<%= pkg.gruntConfig.js.bindPolyfill %>'],
        styles : ['<%= pkg.gruntConfig.css.bootstrap %>', '<%= pkg.gruntConfig.temp.css %>'],
        template : '<%= pkg.gruntConfig.tpl.SpecRunner %>'
      }
    },
    template : {
      'generate-index-page' : {
        options : {
          data : {
            js : {
              highlightjs: '<%= pkg.gruntConfig.js.highlightjs %>',
              modernizr : '<%= pkg.gruntConfig.js.modernizr %>',
              jquery : '<%= pkg.gruntConfig.js.jquery %>',
              slider : '<%= pkg.gruntConfig.temp.js %>'
            },
            css : {
              highlightjs: '<%= pkg.gruntConfig.css.highlightjs %>',
              bootstrap : '<%= pkg.gruntConfig.css.bootstrap %>',
              slider : '<%= pkg.gruntConfig.temp.css %>'
            }
          }
        },
        files : {
          'index.html' : ['<%= pkg.gruntConfig.tpl.index %>']
        }
      },
      'generate-gh-pages' : {
        options : {
          data : {
            js : {
              highlightjs: '<%= pkg.gruntConfig.js.highlightjs %>',
              modernizr : '<%= pkg.gruntConfig.js.modernizr %>',
              jquery : '<%= pkg.gruntConfig.js.jquery %>',
              slider : 'js/bootstrap-slider.js'
            },
            css : {
              highlightjs: '<%= pkg.gruntConfig.css.highlightjs %>',
              bootstrap : 'css/bootstrap.min.css',
              slider : 'css/bootstrap-slider.css'
            }
          }
        },
        files : {
          'index.html' : ['<%= pkg.gruntConfig.tpl.index %>']
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: '<%= pkg.gruntConfig.js.slider %>',
        tasks: ['jshint:js', 'babel', 'jasmine']
      },
      gruntfile: {
        files: '<%= jshint.gruntfile %>',
        tasks: ['jshint:gruntfile']
      },
      spec: {
        files: '<%= pkg.gruntConfig.spec %>',
        tasks: ['jshint:spec', 'jasmine:src']
      },
      css: {
        files: [
          '<%= pkg.gruntConfig.less.slider %>',
          '<%= pkg.gruntConfig.less.rules %>',
          '<%= pkg.gruntConfig.less.variables %>'
        ],
        tasks: ['less:development']
      },
      index: {
        files: '<%= pkg.gruntConfig.tpl.index %>',
        tasks: ['template:generate-index-page']
      }
    },
    connect: {
      server: {
        options: {
          port: "<%= pkg.gruntConfig.devPort %>"
        }
      }
    },
    open : {
      development : {
        path: 'http://localhost:<%= connect.server.options.port %>'
      }
    },
    less: {
      options: {
        paths: ["bower_components/bootstrap/less"]
      },
      development: {
        files: {
          '<%= pkg.gruntConfig.temp.css %>': '<%= pkg.gruntConfig.less.slider %>'
        }
      },
      production: {
        files: {
         '<%= pkg.gruntConfig.temp.css %>': '<%= pkg.gruntConfig.less.slider %>',
        }
      },
      "production-min": {
        options: {
          yuicompress: true
        },
        files: {
         '<%= pkg.gruntConfig.temp.cssMin %>': '<%= pkg.gruntConfig.less.slider %>'
        }
      }
    },
    clean: {
      dist: ["dist"],
      temp: ["temp"]
    },
    bump: {
      options: {
        files: bumpFiles,
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: commitFiles,
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-header');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-sass-lint');
  grunt.loadNpmTasks('grunt-lesslint');

  // Create custom tasks
  grunt.registerTask('append-header', ['header', 'clean:temp']);
  grunt.registerTask('lint', [
    'jshint',
    'lesslint',
    'sasslint'
  ]);
  // npm test -> grunt test
  // How do you set up 'grunt lint' to run first?
  grunt.registerTask('test', [
    'babel',
    'less:development',  // Pass 'development' as argument -> grunt less:development
    'jasmine',
    'clean:temp'
  ]);
  grunt.registerTask('build', [
    'less:development',  // Compile LESS files to CSS
    'test',
    'template:generate-index-page'
  ]);
  grunt.registerTask('build-gh-pages', [
    'less:development',
    'babel',
    'template:generate-gh-pages'
  ]);
  // 1. clean dist/
  // 2. compile .less          -> temp/bootstrap-slider.css
  // 2. compile + minify .less -> temp/bootstrap-slider.min.css
  // 4. compile .js            -> temp/bootstrap-slider.js
  // 5. minify .js             -> temp/bootstrap-slider.min.js
  // 6. add headers .js, .css
  //    -> dist/css/bootstrap-slider.css
  //    -> dist/css/bootstrap-slider.min.css
  //    -> dist/bootstrap-slider.js
  //    -> dist/bootstrap-slider.min.js
  grunt.registerTask('dist', [
    'clean:dist',
    'less:production',
    'less:production-min',
    'babel',
    'uglify',
    'append-header'
  ]);
  grunt.registerTask('development', [
    'less:development',
    'babel',
    'template:generate-index-page',
    'connect',
    'open:development',
    'watch'
  ]);
  grunt.registerTask('production', ['dist']);
  grunt.registerTask('dev', 'development');  // Alias for grunt development
  grunt.registerTask('prod', 'production');  // Alias for grunt production
  grunt.registerTask('default', ['build']);

}; // End of module
