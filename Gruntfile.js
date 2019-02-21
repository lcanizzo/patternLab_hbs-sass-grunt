/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GRUNT
 * The grunt wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/

module.exports = function (grunt) {

  var path = require('path'),
      argv = require('minimist')(process.argv.slice(2));

  // load all grunt tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  

  /******************************************************
   * PATTERN LAB CONFIGURATION
  ******************************************************/

  //read all paths from our namespaced config file
  var config = require('./patternlab-config.json'),
    pl = require('patternlab-node')(config);

  function paths() {
    return config.paths;
  }

  function getConfiguredCleanOption() {
    return config.cleanPublic;
  }

  grunt.registerTask('patternlab', 'create design systems with atomic design', function (arg) {

    if (arguments.length === 0) {
      pl.build(function(){}, getConfiguredCleanOption());
    }

    if (arg && arg === 'version') {
      pl.version();
    }

    if (arg && arg === "patternsonly") {
      pl.patternsonly(function(){},getConfiguredCleanOption());
    }

    if (arg && arg === "help") {
      pl.help();
    }

    if (arg && arg === "liststarterkits") {
      pl.liststarterkits();
    }

    if (arg && arg === "loadstarterkit") {
      pl.loadstarterkit(argv.kit, argv.clean);
    }

    if (arg && (arg !== "version" && arg !== "patternsonly" && arg !== "help" && arg !== "liststarterkits" && arg !== "loadstarterkit")) {
      pl.help();
    }
  });
  
  var sass = require('node-sass');


  grunt.initConfig({
  
    /******************************************************
     * SASS ADDITION
     ******************************************************/
    srcCssDir : path.resolve(paths().source.css),
    srcSassDir : path.resolve(paths().source.sass),
    srcJsDir : path.resolve(paths().source.js),
    srcImgDir : path.resolve(paths().source.images),
    srcFontDir : path.resolve(paths().source.fonts),
    srcRootDir : path.resolve(paths().source.root),
    srcPatternDir : path.resolve(paths().source.patterns),
    srcStyleGuideDir : path.resolve(paths().source.styleguide),
    srcDataDir : path.resolve(paths().source.data),
    
    pubJsDir : path.resolve(paths().public.js),
    pubCssDir : path.resolve(paths().public.css),
    pubFontDir : path.resolve(paths().public.fonts),
    pubImgDir : path.resolve(paths().public.images),
    pubRootDir : path.resolve(paths().public.root),
    pubStyleGuideDir : path.resolve(paths().public.styleguide),
  
    /******************************************************
     * SASS
     ******************************************************/
    sass: {
      options: {
        implementation: sass,
        sourceMap: true
      },
      build: {
        files: {
          '<%= srcCssDir %>/style.css': './source/styles/main.scss'
        }
      }
    },
  
    /******************************************************
     * CONCAT
     ******************************************************/
    concat: {
      options: {
        stripBanners: {
          block: true,
          line: true
        }
      },
      scripts: {
        files: {
          '<%= srcJsDir %>/_generated-main.js': [
            '<%= srcJsDir %>/vendor/jquery/jquery-3.3.1.js',
            '<%= srcJsDir %>/buttons.js'
          ]
        }
      }
    },
    
    /******************************************************
     * COPY TASKS
    ******************************************************/
    copy: {
      main: {
        files: [
          { expand: true, cwd: '<%= srcJsDir %>', src: '_generated-main.js', dest: '<%= pubJsDir %>' },
          { expand: true, cwd: '<%= srcCssDir %>', src: '**/*.css', dest: '<%= pubCssDir %>' },
          { expand: true, cwd: '<%= srcCssDir %>', src: '**/*.css.map', dest: '<%= pubCssDir %>' },
          { expand: true, cwd: '<%= srcImgDir %>', src: '**/*', dest: '<%= pubImgDir %>' },
          { expand: true, cwd: '<%= srcFontDir %>', src: '**/*', dest: '<%= pubFontDir %>' },
          { expand: true, cwd: '<%= srcRootDir %>', src: 'favicon.ico', dest: '<%= pubRootDir %>' },
          { expand: true, cwd: '<%= srcStyleGuideDir %>', src: ['*', '**'], dest: '<%= pubRootDir %>' },
          // slightly inefficient to do this again - I am not a grunt glob master. someone fix
          { expand: true, flatten: true, cwd: path.resolve('<%= srcStyleGuideDir %>', 'styleguide', 'css', 'custom'), src: '*.css)', dest: path.resolve('<%= pubStyleGuideDir %>', 'css') }
        ]
      }
    },
    
    /******************************************************
     * SERVER AND WATCH TASKS
    ******************************************************/
    watch: {
      all: {
        files: [
          '<%= srcCssDir %>/**/*.css',
          '<%= srcSassDir %>/**/*.scss',
          '<%= srcStyleGuideDir %>/css/*.css',
          '<%= srcPatternDir %>/**/*',
          '<%= srcFontDir %>/**/*',
          '<%= srcImgDir %>/**/*',
          '<%= srcDataDir %>/**/.json',
          '<%= srcJsDir %>/**/*.js',
          '<%= srcRootDir %>/*.ico'
        ],
        tasks: ['default', 'bsReload:css']
      }
    },
    browserSync: {
      dev: {
        options: {
          server:  '<%= pubRootDir %>',
          watchTask: true,
          watchOptions: {
            ignoreInitial: true,
            ignored: '*.html'
          },
          snippetOptions: {
            // Ignore all HTML files within the templates folder
            blacklist: ['/index.html', '/', '/?*']
          },
          plugins: [
            {
              module: 'bs-html-injector',
              options: {
                files: ['<%= pubRootDir %>/index.html', '<%= pubStyleGuideDir %>/styleguide.html']
              }
            }
          ],
          notify: {
            styles: [
              'display: none',
              'padding: 15px',
              'font-family: sans-serif',
              'position: fixed',
              'font-size: 1em',
              'z-index: 9999',
              'bottom: 0px',
              'right: 0px',
              'border-top-left-radius: 5px',
              'background-color: #1B2032',
              'opacity: 0.4',
              'margin: 0',
              'color: white',
              'text-align: center'
            ]
          }
        }
      }
    },
    bsReload: {
      css: '<%= pubRootDir %>/**/*.css'
    }
  });

  /******************************************************
   * COMPOUND TASKS
  ******************************************************/

  grunt.registerTask('default', ['patternlab', 'sass', 'concat:scripts', 'copy:main']);
  grunt.registerTask('patternlab:build', ['patternlab', 'sass', 'concat', 'copy:main']);
  grunt.registerTask('patternlab:watch', ['patternlab', 'sass', 'concat', 'copy:main', 'watch:all']);
  grunt.registerTask('patternlab:serve', ['patternlab', 'sass', 'concat', 'copy:main', 'browserSync', 'watch:all']);

};
